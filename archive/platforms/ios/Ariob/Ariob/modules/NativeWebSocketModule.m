//
//  NativeWebSocketModule.m
//  Ariob
//
//  Created by Natnael Teferi on 10/26/25.
//

#import "NativeWebSocketModule.h"
#import <SocketRocket/SRWebSocket.h>
#import <objc/runtime.h>

/**
 * Category to add Lynx tagging to SRWebSocket
 */
@interface SRWebSocket (Lynx)
@property (nonatomic, copy, nullable) NSNumber *lynxTag;
@end

@implementation SRWebSocket (Lynx)

- (NSNumber *)lynxTag {
  return objc_getAssociatedObject(self, _cmd);
}

- (void)setLynxTag:(NSNumber *)lynxTag {
  objc_setAssociatedObject(self, @selector(lynxTag), lynxTag, OBJC_ASSOCIATION_COPY_NONATOMIC);
}

@end

@implementation NativeWebSocketModule {
  LynxContext *context_;  // Strong reference to prevent deallocation
  NSMutableDictionary<NSNumber *, SRWebSocket *> *sockets_;
}

+ (NSString *)name {
  return @"NativeWebSocketModule";
}

+ (NSDictionary<NSString *, NSString *> *)methodLookup {
  return @{
    @"connect" : NSStringFromSelector(@selector(connect:id:)),
    @"send" : NSStringFromSelector(@selector(send:message:)),
    @"close" : NSStringFromSelector(@selector(close:code:reason:))
  };
}

- (instancetype)initWithLynxContext:(LynxContext *)context {
  NSLog(@"[NativeWebSocketModule] ========== INIT ==========");
  NSLog(@"[NativeWebSocketModule] initWithLynxContext called");
  NSLog(@"[NativeWebSocketModule] Context parameter: %@", context);
  NSLog(@"[NativeWebSocketModule] Context is nil: %@", context ? @"NO" : @"YES");

  self = [super init];
  if (self) {
    context_ = context;
    sockets_ = [NSMutableDictionary new];

    NSLog(@"[NativeWebSocketModule] Context stored: %@", context_);
    NSLog(@"[NativeWebSocketModule] Stored context is nil: %@", context_ ? @"NO" : @"YES");
  }
  NSLog(@"[NativeWebSocketModule] ======================================");
  return self;
}

- (dispatch_queue_t)methodQueue {
  return dispatch_get_main_queue();
}

#pragma mark - Public Methods (matching typing.d.ts)

- (void)connect:(NSString *)url id:(int)socketID {
  NSLog(@"[NativeWebSocketModule] ========== CONNECT ==========");
  NSLog(@"[NativeWebSocketModule] URL: %@", url);
  NSLog(@"[NativeWebSocketModule] Socket ID: %d", socketID);

  NSURL *wsURL = [NSURL URLWithString:url];
  NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:wsURL];

  // Load cookies for secure connections
  NSURLComponents *components = [NSURLComponents componentsWithURL:wsURL
                                           resolvingAgainstBaseURL:true];
  if ([components.scheme.lowercaseString isEqualToString:@"wss"]) {
    components.scheme = @"https";
  }

  NSArray<NSHTTPCookie *> *cookies =
      [[NSHTTPCookieStorage sharedHTTPCookieStorage] cookiesForURL:components.URL];
  request.allHTTPHeaderFields = [NSHTTPCookie requestHeaderFieldsWithCookies:cookies];

  SRWebSocket *webSocket = [[SRWebSocket alloc] initWithURLRequest:request];
  [webSocket setDelegateDispatchQueue:[self methodQueue]];
  webSocket.delegate = self;
  webSocket.lynxTag = @(socketID);

  sockets_[@(socketID)] = webSocket;
  NSLog(@"[NativeWebSocketModule] ✓ WebSocket created, calling open()...");
  [webSocket open];
  NSLog(@"[NativeWebSocketModule] ✓ open() called");
  NSLog(@"[NativeWebSocketModule] =======================================");
}

- (void)send:(int)socketID message:(NSString *)message {
  SRWebSocket *webSocket = sockets_[@(socketID)];
  if (webSocket) {
    [webSocket sendString:message error:nil];
  }
}

- (void)close:(int)socketID code:(int)code reason:(NSString *)reason {
  SRWebSocket *webSocket = sockets_[@(socketID)];
  if (webSocket) {
    [webSocket closeWithCode:code reason:reason];
    [sockets_ removeObjectForKey:@(socketID)];
  }
}

#pragma mark - SRWebSocketDelegate

- (void)webSocketDidOpen:(SRWebSocket *)webSocket {
  NSLog(@"[NativeWebSocketModule] ========== WEBSOCKET OPENED ==========");
  NSLog(@"[NativeWebSocketModule] Socket ID: %@", webSocket.lynxTag);

  __strong typeof(context_) context = context_;
  if (!context) {
    NSLog(@"[NativeWebSocketModule] ❌ ERROR: context is nil!");
    return;
  }

  NSLog(@"[NativeWebSocketModule] ✓ Context exists, emitting websocket:open");
  [context sendGlobalEvent:@"websocket:open"
                withParams:@[@{@"id": webSocket.lynxTag}]];
  NSLog(@"[NativeWebSocketModule] ✓ websocket:open event emitted");
  NSLog(@"[NativeWebSocketModule] ====================================");
}

- (void)webSocket:(SRWebSocket *)webSocket didReceiveMessage:(id)message {
  NSLog(@"[NativeWebSocketModule] ========== MESSAGE RECEIVED ==========");
  NSLog(@"[NativeWebSocketModule] Socket ID: %@", webSocket.lynxTag);

  __strong typeof(context_) context = context_;
  if (!context) {
    NSLog(@"[NativeWebSocketModule] ❌ ERROR: context is nil!");
    return;
  }

  NSString *data;
  if ([message isKindOfClass:[NSData class]]) {
    data = [[NSString alloc] initWithData:message encoding:NSUTF8StringEncoding];
    NSLog(@"[NativeWebSocketModule] Message type: NSData, length: %lu", (unsigned long)[(NSData *)message length]);
  } else {
    data = message;
    NSLog(@"[NativeWebSocketModule] Message type: NSString, length: %lu", (unsigned long)[data length]);
  }

  NSLog(@"[NativeWebSocketModule] Message preview: %@", [data substringToIndex:MIN(100, [data length])]);
  NSLog(@"[NativeWebSocketModule] ✓ Emitting websocket:message event");
  [context sendGlobalEvent:@"websocket:message"
                withParams:@[@{@"id": webSocket.lynxTag, @"data": data}]];
  NSLog(@"[NativeWebSocketModule] ✓ websocket:message event emitted");
  NSLog(@"[NativeWebSocketModule] =====================================");
}

- (void)webSocket:(SRWebSocket *)webSocket didFailWithError:(NSError *)error {
  __strong typeof(context_) context = context_;
  if (!context) return;

  NSNumber *socketID = webSocket.lynxTag;
  [sockets_ removeObjectForKey:socketID];

  [context sendGlobalEvent:@"websocket:error"
                withParams:@[@{
                  @"id": socketID,
                  @"message": error.localizedDescription ?: @"Unknown error"
                }]];
}

- (void)webSocket:(SRWebSocket *)webSocket
    didCloseWithCode:(NSInteger)code
              reason:(NSString *)reason
            wasClean:(BOOL)wasClean {
  __strong typeof(context_) context = context_;
  if (!context) return;

  NSNumber *socketID = webSocket.lynxTag;
  [sockets_ removeObjectForKey:socketID];

  [context sendGlobalEvent:@"websocket:close"
                withParams:@[@{
                  @"id": socketID,
                  @"code": @(code),
                  @"reason": reason ?: @""
                }]];
}

@end
