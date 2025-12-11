// Copyright 2022 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
#ifndef DEVTOOL_BASE_DEVTOOL_DARWIN_IOS_LOGBOX_DEVTOOLLOGBOXNOTIFICATION_H_
#define DEVTOOL_BASE_DEVTOOL_DARWIN_IOS_LOGBOX_DEVTOOLLOGBOXNOTIFICATION_H_

#import <Foundation/Foundation.h>
#import "DevToolLogBoxManager.h"

NS_ASSUME_NONNULL_BEGIN

@interface DevToolLogBoxNotificationManager : NSObject

- (instancetype)initWithLogBoxManager:(DevToolLogBoxManager *)manager;
- (void)showNotificationWithMsg:(nullable NSString *)msg withLevel:(NSString *)level;
- (void)updateNotificationMsg:(nullable NSString *)msg withLevel:(NSString *)level;
- (void)updateNotificationMsgCount:(nullable NSNumber *)count withLevel:(NSString *)level;
- (void)showNotification;
- (void)hideNotification;
- (void)removeNotificationWithLevel:(NSString *)level;
- (void)closeNotification:(NSString *)level;

@end

NS_ASSUME_NONNULL_END

#endif  // DEVTOOL_BASE_DEVTOOL_DARWIN_IOS_LOGBOX_DEVTOOLLOGBOXNOTIFICATION_H_
