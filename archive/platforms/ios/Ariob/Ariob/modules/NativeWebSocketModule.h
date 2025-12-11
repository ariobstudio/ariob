//
//  NativeWebSocketModule.h
//  Ariob
//
//  Created by Natnael Teferi on 10/26/25.
//

#import <Foundation/Foundation.h>
#import <Lynx/LynxContextModule.h>
#import <Lynx/LynxContext.h>

NS_ASSUME_NONNULL_BEGIN

/**
 * Native WebSocket Module
 * - connect(url: string, id: number): void
 * - send(id: number, message: string): void
 * - close(id: number, code: number, reason: string): void
 */
@interface NativeWebSocketModule : NSObject <LynxContextModule>

@end

NS_ASSUME_NONNULL_END
