// Copyright 2020 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
#ifndef DEVTOOL_BASE_DEVTOOL_DARWIN_IOS_LOGBOX_DEVTOOLLOGBOX_H_
#define DEVTOOL_BASE_DEVTOOL_DARWIN_IOS_LOGBOX_DEVTOOLLOGBOX_H_

#import <Foundation/Foundation.h>
#import "DevToolLogBoxManager.h"

NS_ASSUME_NONNULL_BEGIN

@interface DevToolLogBox : NSObject

- (instancetype)initWithLogBoxManager:(DevToolLogBoxManager *)manager;
- (void)updateViewInfo:(nullable NSString *)url
          currentIndex:(NSInteger)index
            totalCount:(NSInteger)count;
- (void)updateEntryUrlForLogSrc:(nullable NSString *)url;
- (BOOL)onNewLog:(nullable NSString *)message
       withLevel:(NSString *)level
       withProxy:(DevToolLogBoxProxy *)proxy;
- (BOOL)isShowing;
- (NSString *)getCurrentLevel;
- (nullable DevToolLogBoxProxy *)getCurrentProxy;
- (void)dismissIfNeeded;

@end

NS_ASSUME_NONNULL_END

#endif  // DEVTOOL_BASE_DEVTOOL_DARWIN_IOS_LOGBOX_DEVTOOLLOGBOX_H_
