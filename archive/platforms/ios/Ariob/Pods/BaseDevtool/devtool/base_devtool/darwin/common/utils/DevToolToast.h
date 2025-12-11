// Copyright 2022 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
#ifndef DEVTOOL_BASE_DEVTOOL_DARWIN_COMMON_UTILS_DEVTOOLTOAST_H_
#define DEVTOOL_BASE_DEVTOOL_DARWIN_COMMON_UTILS_DEVTOOLTOAST_H_

@interface DevToolToast : NSObject

// show toast safely on main thread
+ (void)showToast:(NSString*)message;

@end

#endif  // DEVTOOL_BASE_DEVTOOL_DARWIN_COMMON_UTILS_DEVTOOLTOAST_H_
