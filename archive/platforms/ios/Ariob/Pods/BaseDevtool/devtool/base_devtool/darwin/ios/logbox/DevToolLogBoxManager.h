// Copyright 2022 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
#ifndef DEVTOOL_BASE_DEVTOOL_DARWIN_IOS_LOGBOX_DEVTOOLLOGBOXMANAGER_H_
#define DEVTOOL_BASE_DEVTOOL_DARWIN_IOS_LOGBOX_DEVTOOLLOGBOXMANAGER_H_

#import <Foundation/Foundation.h>
#import "DevToolLogBoxHelper.h"
#import "DevToolLogBoxProxy.h"

NS_ASSUME_NONNULL_BEGIN

@interface DevToolLogBoxManager : NSObject

- (instancetype)initWithViewController:(nullable UIViewController *)controller;

- (void)onNewLog:(nullable NSString *)message
       withLevel:(NSString *)level
       withProxy:(DevToolLogBoxProxy *)proxy;
- (void)updateEntryUrlForLogSrc:(nullable NSString *)url withProxy:(DevToolLogBoxProxy *)proxy;
- (void)showLogBoxWithLevel:(NSString *)level;
- (void)removeCurrentLogsWithLevel:(NSString *)level;
- (void)removeLogsWithLevel:(NSString *)level;
- (void)changeView:(nullable NSNumber *)indexNum withLevel:(NSString *)level;
- (void)onProxyReset:(DevToolLogBoxProxy *)proxy;  // long press or Page.reload
- (void)showNotification;
- (void)hideNotification;

@end

NS_ASSUME_NONNULL_END

#endif  // DEVTOOL_BASE_DEVTOOL_DARWIN_IOS_LOGBOX_DEVTOOLLOGBOXMANAGER_H_
