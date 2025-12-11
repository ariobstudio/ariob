// Copyright 2021 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
#ifndef DEVTOOL_BASE_DEVTOOL_DARWIN_COMMON_UTILS_DEVTOOLDOWNLOADER_H_
#define DEVTOOL_BASE_DEVTOOL_DARWIN_COMMON_UTILS_DEVTOOLDOWNLOADER_H_

typedef void (^downloadCallback)(NSData* _Nullable data, NSError* _Nullable error);

@interface DevToolDownloader : NSObject

+ (void)download:(NSString* _Nonnull)url withCallback:(downloadCallback _Nonnull)callback;

@end

#endif  // DEVTOOL_BASE_DEVTOOL_DARWIN_COMMON_UTILS_DEVTOOLDOWNLOADER_H_
