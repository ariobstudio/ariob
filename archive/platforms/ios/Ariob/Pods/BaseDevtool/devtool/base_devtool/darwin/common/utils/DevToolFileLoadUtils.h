// Copyright 2025 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
#ifndef DEVTOOL_BASE_DEVTOOL_DARWIN_COMMON_UTILS_DEVTOOLFILELOADUTILS_H_
#define DEVTOOL_BASE_DEVTOOL_DARWIN_COMMON_UTILS_DEVTOOLFILELOADUTILS_H_

NS_ASSUME_NONNULL_BEGIN

typedef void (^DevToolFileLoadCallback)(NSString *_Nullable data, NSError *_Nullable error);

@interface DevToolFileLoadUtils : NSObject
+ (void)loadFileFromBundle:(NSString *)bundleUrl
                  filePath:(NSString *)path
                      type:(NSString *)type
                completion:(DevToolFileLoadCallback)completion;
+ (void)loadFileFromURL:(NSString *)url completion:(DevToolFileLoadCallback)completion;
@end

NS_ASSUME_NONNULL_END

#endif  // DEVTOOL_BASE_DEVTOOL_DARWIN_COMMON_UTILS_DEVTOOLFILELOADUTILS_H_
