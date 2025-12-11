// Copyright 2022 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
#ifndef DEVTOOL_BASE_DEVTOOL_DARWIN_IOS_LOGBOX_DEVTOOLLOGBOXOWNER_H_
#define DEVTOOL_BASE_DEVTOOL_DARWIN_IOS_LOGBOX_DEVTOOLLOGBOXOWNER_H_

#import <Foundation/Foundation.h>
#import "DevToolLogBoxHelper.h"
#import "DevToolLogBoxProxy.h"

NS_ASSUME_NONNULL_BEGIN

@interface DevToolLogBoxOwner : NSObject

+ (DevToolLogBoxOwner *)getInstance;
- (void)insertLogBoxProxy:(DevToolLogBoxProxy *)proxy withController:(UIViewController *)controller;
- (void)onNewLog:(nullable NSString *)message
       withLevel:(NSString *)level
       withProxy:(DevToolLogBoxProxy *)proxy;
- (void)updateEntryUrlForLogSrc:(nullable NSString *)url withProxy:(DevToolLogBoxProxy *)proxy;
- (void)onProxyReset:(DevToolLogBoxProxy *)proxy;  // long press or Page.reload

@end

NS_ASSUME_NONNULL_END

#endif  // DEVTOOL_BASE_DEVTOOL_DARWIN_IOS_LOGBOX_DEVTOOLLOGBOXOWNER_H_
