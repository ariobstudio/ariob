// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

#import <Lynx/LynxUI.h>

NS_ASSUME_NONNULL_BEGIN

/**
 * Native pager view component for horizontal page-based navigation.
 *
 * Features:
 * - Native iOS paging with UIScrollView
 * - Automatic gesture conflict resolution (vertical vs horizontal scrolling)
 * - Smooth momentum-based page transitions
 * - Support for nested vertical scroll views
 *
 * Usage:
 * <carousel current-page="0" bindpagechange={handler}>
 *   <view>Page 1</view>
 *   <view>Page 2</view>
 * </carousel>
 */
@interface LynxCarousel : LynxUI<UIScrollView *> <UIScrollViewDelegate>

/**
 * Current page index (0-based)
 */
@property (nonatomic, assign) NSInteger currentPage;

/**
 * Whether paging is enabled
 */
@property (nonatomic, assign) BOOL pagingEnabled;

@end

NS_ASSUME_NONNULL_END
