// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

#import "LynxCarousel.h"
#import <Lynx/LynxComponentRegistry.h>
#import <Lynx/LynxPropsProcessor.h>
#import <Lynx/LynxUIOwner.h>

@interface LynxCarousel ()

@property (nonatomic, assign) NSInteger lastReportedPage;
@property (nonatomic, assign) BOOL isSettingPage;

@end

@implementation LynxCarousel

- (UIScrollView *)createView {
  UIScrollView *scrollView = [[UIScrollView alloc] init];
  scrollView.delegate = self;
  scrollView.pagingEnabled = YES;
  scrollView.showsHorizontalScrollIndicator = NO;
  scrollView.showsVerticalScrollIndicator = NO;
  scrollView.scrollsToTop = NO;
  scrollView.bounces = YES;
  scrollView.alwaysBounceVertical = NO;
  scrollView.alwaysBounceHorizontal = YES;
  scrollView.directionalLockEnabled = YES; // Lock to single axis
  scrollView.contentInsetAdjustmentBehavior = UIScrollViewContentInsetAdjustmentNever;

  // Enable simultaneous gesture recognition for nested scroll views
  scrollView.delaysContentTouches = NO;
  scrollView.canCancelContentTouches = YES;

  _lastReportedPage = 0;
  _currentPage = 0;
  _pagingEnabled = YES;
  _isSettingPage = NO;

  return scrollView;
}

- (void)layoutDidFinished {
  [super layoutDidFinished];
  [self layoutPages];
}

/**
 * Layout all child pages horizontally
 */
- (void)layoutPages {
  CGFloat pageWidth = CGRectGetWidth(self.view.frame);
  CGFloat pageHeight = CGRectGetHeight(self.view.frame);

  if (pageWidth == 0 || pageHeight == 0) {
    return;
  }

  NSInteger pageCount = self.view.subviews.count;

  // Position each page
  for (NSInteger i = 0; i < pageCount; i++) {
    UIView *pageView = self.view.subviews[i];
    pageView.frame = CGRectMake(i * pageWidth, 0, pageWidth, pageHeight);
  }

  // Update content size
  self.view.contentSize = CGSizeMake(pageWidth * pageCount, pageHeight);

  // Scroll to current page if needed
  if (!_isSettingPage) {
    [self scrollToPage:_currentPage animated:NO];
  }
}

/**
 * Scroll to a specific page
 */
- (void)scrollToPage:(NSInteger)page animated:(BOOL)animated {
  NSInteger pageCount = self.view.subviews.count;
  if (page < 0 || page >= pageCount) {
    return;
  }

  CGFloat pageWidth = CGRectGetWidth(self.view.frame);
  CGFloat offsetX = page * pageWidth;

  _isSettingPage = YES;
  [self.view setContentOffset:CGPointMake(offsetX, 0) animated:animated];

  // Reset flag after animation completes or immediately if not animated
  if (!animated) {
    _isSettingPage = NO;
  } else {
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.3 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
      self.isSettingPage = NO;
    });
  }
}

#pragma mark - Property Setters

LYNX_PROP_SETTER("current-page", setCurrentPage, NSInteger) {
  _currentPage = value;
  [self scrollToPage:value animated:YES];
}

LYNX_PROP_SETTER("paging-enabled", setPagingEnabled, BOOL) {
  _pagingEnabled = value;
  self.view.pagingEnabled = value;
}

#pragma mark - UIScrollViewDelegate

- (void)scrollViewDidScroll:(UIScrollView *)scrollView {
  // Calculate current page based on scroll position
  CGFloat pageWidth = CGRectGetWidth(scrollView.frame);
  if (pageWidth == 0) {
    return;
  }

  CGFloat offsetX = scrollView.contentOffset.x;
  NSInteger currentPage = (NSInteger)round(offsetX / pageWidth);

  // Clamp to valid range
  NSInteger pageCount = scrollView.subviews.count;
  currentPage = MAX(0, MIN(currentPage, pageCount - 1));

  _currentPage = currentPage;
}

- (void)scrollViewDidEndDecelerating:(UIScrollView *)scrollView {
  [self reportPageChangeIfNeeded];
}

- (void)scrollViewDidEndDragging:(UIScrollView *)scrollView willDecelerate:(BOOL)decelerate {
  if (!decelerate) {
    [self reportPageChangeIfNeeded];
  }
}

- (void)scrollViewDidEndScrollingAnimation:(UIScrollView *)scrollView {
  _isSettingPage = NO;
  [self reportPageChangeIfNeeded];
}

/**
 * Emit pagechange event if page has changed
 */
- (void)reportPageChangeIfNeeded {
  if (_currentPage != _lastReportedPage) {
    _lastReportedPage = _currentPage;

    [self emitEvent:@"pagechange"
             detail:@{
               @"position" : @(_currentPage),
               @"offset" : @(0.0)
             }];
  }
}

/**
 * Allow simultaneous gesture recognition with nested scroll views
 */
- (BOOL)gestureRecognizer:(UIGestureRecognizer *)gestureRecognizer
shouldRecognizeSimultaneouslyWithGestureRecognizer:(UIGestureRecognizer *)otherGestureRecognizer {
  // Allow nested vertical scroll views to work alongside horizontal paging
  return YES;
}

#pragma mark - Event Emission

- (void)emitEvent:(NSString *)name detail:(NSDictionary *)detail {
  LynxCustomEvent *eventInfo = [[LynxDetailEvent alloc] initWithName:name
                                                          targetSign:[self sign]
                                                              detail:detail];
  [self.context.eventEmitter dispatchCustomEvent:eventInfo];
}

@end
