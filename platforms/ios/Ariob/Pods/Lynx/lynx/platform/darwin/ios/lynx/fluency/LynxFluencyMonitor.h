// Copyright 2023 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
#ifndef PLATFORM_DARWIN_IOS_LYNX_FLUENCY_LYNXFLUENCYMONITOR_H_
#define PLATFORM_DARWIN_IOS_LYNX_FLUENCY_LYNXFLUENCYMONITOR_H_

#import <Lynx/LynxBooleanOption.h>
#import <Lynx/LynxScrollListener.h>

NS_ASSUME_NONNULL_BEGIN

@interface LynxFluencyMonitor : NSObject

@property(nonatomic, readonly) BOOL shouldSendAllScrollEvent;

- (void)startWithScrollInfo:(LynxScrollInfo*)info;

- (void)stopWithScrollInfo:(LynxScrollInfo*)info;

/// Set the sampling decision of whether to enable fluency metics collection.
///
/// If PageConfig is not configured with kEnableLynxScrollFluency, Lynx will use
/// the value passed to `LynxView(Builder).setFluencyTracerEnabled:` to determine
/// whether to enable fluency metics collection.
///
/// @note This method is only effective when PageConfig is not configured with
/// kEnableLynxScrollFluency. See `setPageConfigProbability:` for more details.
///
/// @param enabledBySampling The sampling decision of whether to enable fluency
/// metics collection.
- (void)setEnabledBySampling:(LynxBooleanOption)enabledBySampling;

/// Set the probability of enabling fluency metics collection based on PageConfig.
///
/// If PageConfig is configured with kEnableLynxScrollFluency, Lynx will determine
/// whether to enable fluency metics based on this probability when creating a
/// LynxView.
- (void)setPageConfigProbability:(CGFloat)probability;

@end

NS_ASSUME_NONNULL_END

#endif  // PLATFORM_DARWIN_IOS_LYNX_FLUENCY_LYNXFLUENCYMONITOR_H_
