// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import "LynxTextListMarker.h"

NS_ASSUME_NONNULL_BEGIN

/**
 * Result of list continuation operation
 */
@interface LynxListContinuationResult : NSObject

/** Whether to continue the list (insert marker on new line) */
@property (nonatomic, assign) BOOL shouldContinue;

/** Whether to exit the list (remove marker from current line) */
@property (nonatomic, assign) BOOL shouldExit;

/** The marker to insert if continuing (e.g., "• ", "2. ") */
@property (nonatomic, copy, nullable) NSString *markerToInsert;

/** The list type being continued */
@property (nonatomic, assign) LynxListType listType;

@end

/**
 * Result of list toggle operation
 */
@interface LynxListToggleResult : NSObject

/** Whether the operation succeeded */
@property (nonatomic, assign) BOOL success;

/** The resulting paragraph text */
@property (nonatomic, copy) NSString *resultText;

/** Cursor adjustment (positive = move right, negative = move left) */
@property (nonatomic, assign) NSInteger cursorAdjustment;

/** Whether list was removed (NO = added) */
@property (nonatomic, assign) BOOL wasRemoved;

@end

/**
 * Result of list type conversion
 */
@interface LynxListConversionResult : NSObject

/** Whether the conversion succeeded */
@property (nonatomic, assign) BOOL success;

/** The resulting paragraph text */
@property (nonatomic, copy) NSString *resultText;

/** Cursor adjustment */
@property (nonatomic, assign) NSInteger cursorAdjustment;

/** The source list type */
@property (nonatomic, assign) LynxListType fromType;

/** The target list type */
@property (nonatomic, assign) LynxListType toType;

@end

/**
 * Helper class for list manipulation operations
 *
 * Provides utilities for:
 * - List continuation logic (Enter key handling)
 * - List type toggling and conversion
 * - List item indentation
 * - List item movement (up/down)
 */
@interface LynxTextListHelper : NSObject

#pragma mark - List Continuation

/**
 * Calculate list continuation behavior when Enter is pressed
 *
 * Determines whether to:
 * - Continue the list with a new marker
 * - Exit the list (if current item is empty)
 * - Do nothing (if not in a list)
 *
 * @param paragraphText The current paragraph text
 * @return Continuation result with action and marker
 */
+ (LynxListContinuationResult *)calculateListContinuation:(NSString *)paragraphText;

/**
 * Handle list continuation in attributed string
 *
 * Modifies the attributed string to either:
 * - Insert a new line with list marker
 * - Remove the marker from an empty list item
 *
 * @param attrString The mutable attributed string to modify
 * @param range The insertion range (cursor position)
 * @param paragraphRange The range of the current paragraph
 * @param result The continuation result
 * @return The new cursor position
 */
+ (NSRange)applyListContinuation:(NSMutableAttributedString *)attrString
                         atRange:(NSRange)range
                  paragraphRange:(NSRange)paragraphRange
                          result:(LynxListContinuationResult *)result
                      attributes:(NSDictionary *)attributes;

#pragma mark - Block Format Clearing

/**
 * Remove all block-level markers from paragraph text
 *
 * Removes list markers (bullet, ordered, task) and blockquote markers.
 * Used to ensure mutual exclusion between block types.
 *
 * @param paragraphText The paragraph text
 * @return Text with all block markers removed
 */
+ (NSString *)clearBlockMarkers:(NSString *)paragraphText;

#pragma mark - List Toggle Operations

/**
 * Toggle bullet list on a paragraph
 *
 * If paragraph has "• " prefix, removes it.
 * If paragraph doesn't have it, adds it.
 *
 * @param paragraphText The paragraph text
 * @return Toggle result with new text and cursor adjustment
 */
+ (LynxListToggleResult *)toggleBulletList:(NSString *)paragraphText;

/**
 * Toggle ordered list on a paragraph
 *
 * If paragraph has "N. " prefix, removes it.
 * If paragraph doesn't have it, adds "1. ".
 *
 * @param paragraphText The paragraph text
 * @return Toggle result with new text and cursor adjustment
 */
+ (LynxListToggleResult *)toggleOrderedList:(NSString *)paragraphText;

/**
 * Toggle blockquote on a paragraph
 *
 * If paragraph has "│ " prefix, removes it.
 * If paragraph doesn't have it, adds it.
 *
 * @param paragraphText The paragraph text
 * @return Toggle result with new text and cursor adjustment
 */
+ (LynxListToggleResult *)toggleBlockquote:(NSString *)paragraphText;

#pragma mark - List Type Conversion

/**
 * Convert list type from one to another
 *
 * Converts between bullet, ordered, and task lists.
 * Returns failure if not in a convertible list.
 *
 * @param paragraphText The paragraph text
 * @return Conversion result with new text and adjustments
 */
+ (LynxListConversionResult *)convertListType:(NSString *)paragraphText;

/**
 * Convert from bullet to ordered list
 *
 * @param paragraphText The paragraph text (must start with "• ")
 * @param number The number to use for ordered list
 * @return Conversion result
 */
+ (LynxListConversionResult *)convertBulletToOrdered:(NSString *)paragraphText
                                              number:(NSInteger)number;

/**
 * Convert from ordered to bullet list
 *
 * @param paragraphText The paragraph text (must start with "N. ")
 * @return Conversion result
 */
+ (LynxListConversionResult *)convertOrderedToBullet:(NSString *)paragraphText;

#pragma mark - Indentation

/**
 * Indent a paragraph (add 2 spaces at beginning)
 *
 * @param paragraphText The paragraph text
 * @return New text with indent added
 */
+ (NSString *)indentParagraph:(NSString *)paragraphText;

/**
 * Outdent a paragraph (remove 2 spaces from beginning)
 *
 * @param paragraphText The paragraph text
 * @param outSuccess Pointer to store whether outdent was possible
 * @return New text with indent removed (or original if can't outdent)
 */
+ (NSString *)outdentParagraph:(NSString *)paragraphText success:(BOOL *)outSuccess;

/**
 * Check if paragraph can be outdented
 *
 * @param paragraphText The paragraph text
 * @return YES if paragraph starts with spaces that can be removed
 */
+ (BOOL)canOutdentParagraph:(NSString *)paragraphText;

#pragma mark - Line Movement

/**
 * Swap two lines in attributed string
 *
 * @param attrString The mutable attributed string
 * @param range1 The first line range
 * @param range2 The second line range
 * @return YES if swap succeeded
 */
+ (BOOL)swapLines:(NSMutableAttributedString *)attrString
           range1:(NSRange)range1
           range2:(NSRange)range2;

/**
 * Calculate new cursor position after line swap
 *
 * @param currentSelection The current selection
 * @param currentLineRange The range of the line being moved
 * @param targetLineRange The range of the target position
 * @param movingUp YES if moving up, NO if moving down
 * @return New selection range
 */
+ (NSRange)adjustSelectionAfterSwap:(NSRange)currentSelection
                   currentLineRange:(NSRange)currentLineRange
                    targetLineRange:(NSRange)targetLineRange
                          movingUp:(BOOL)movingUp;

@end

NS_ASSUME_NONNULL_END
