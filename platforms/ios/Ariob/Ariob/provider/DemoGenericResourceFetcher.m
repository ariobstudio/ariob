// Copyright 2025 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

#import "DemoGenericResourceFetcher.h"

@implementation DemoGenericResourceFetcher
+ (NSString*)resolveLocalAssetPath:(NSString*)urlString {
  if ([urlString containsString:@"static/font/"] ||
      [urlString containsString:@"static/images/"] ||
      [urlString containsString:@"static/icons/"]) {

    NSString* filename = [urlString lastPathComponent];

    NSString* resourcesPath = [[NSBundle mainBundle] resourcePath];
    NSString* fullPath = [[[resourcesPath stringByAppendingPathComponent:@"Resource"]
                           stringByAppendingPathComponent:@"icons"]
                           stringByAppendingPathComponent:filename];


    if ([[NSFileManager defaultManager] fileExistsAtPath:fullPath]) {
      return fullPath;
    }
  }

  return nil;
}

- (dispatch_block_t)fetchResource:(LynxResourceRequest*)request
                       onComplete:(LynxGenericResourceCompletionBlock)callback {
  NSString* localPath = [DemoGenericResourceFetcher resolveLocalAssetPath:request.url];
  if (localPath) {
    NSData* data = [NSData dataWithContentsOfFile:localPath];
    if (data) {
      dispatch_async(dispatch_get_main_queue(), ^{
        callback(data, nil);
      });
      return nil;
    }
  }

  NSURL* url = [NSURL URLWithString:request.url];
  NSURLRequest* urlRequest = [NSURLRequest requestWithURL:url
                                              cachePolicy:NSURLRequestReloadIgnoringCacheData
                                          timeoutInterval:5];

  NSURLSessionDataTask* dataTask = [[NSURLSession sharedSession]
      dataTaskWithRequest:urlRequest
        completionHandler:^(NSData* _Nullable data, NSURLResponse* _Nullable response,
                            NSError* _Nullable error) {
          callback(data, error);
        }];

  [dataTask resume];
  return nil;
}

- (dispatch_block_t)fetchResourcePath:(LynxResourceRequest*)request
                           onComplete:(LynxGenericResourcePathCompletionBlock)callback {
  NSError* error = [NSError
      errorWithDomain:NSCocoaErrorDomain
                 code:100
             userInfo:@{NSLocalizedDescriptionKey : @"fetchResourcePath not implemented yet."}];
  callback(nil, error);
  return nil;
}

- (dispatch_block_t)fetchStream:(LynxResourceRequest*)request
                     withStream:(id<LynxResourceStreamLoadDelegate>)delegate {
  [delegate onError:@"fetchStream not implemented yet."];
  return nil;
}

@end
