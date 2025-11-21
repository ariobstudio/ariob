// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

/**
 * List type enumeration for type safety
 */
typedef NS_ENUM(NSInteger, LynxListType) {
    LynxListTypeNone,
    LynxListTypeBullet,
    LynxListTypeOrdered,
    LynxListTypeTask,
    LynxListTypeBlockquote
};

/**
 * Result of list marker detection
 */
@interface LynxListMarkerInfo : NSObject

/** The detected list type */
@property (nonatomic, assign) LynxListType listType;

/** The marker string (e.g., "• ", "1. ", "☐ ") */
@property (nonatomic, copy) NSString *marker;

/** Length of the marker prefix in characters */
@property (nonatomic, assign) NSInteger markerLength;

/** The text content after the marker */
@property (nonatomic, copy) NSString *contentAfterMarker;

/** For ordered lists, the current number */
@property (nonatomic, assign) NSInteger currentNumber;

/** Whether the marker was detected */
@property (nonatomic, assign) BOOL hasMarker;

@end

/**
 * Helper class for list marker generation and parsing
 *
 * Provides pure functions for:
 * - Detecting list markers in text
 * - Generating list markers for different types
 * - Parsing list information from paragraphs
 */
@interface LynxTextListMarker : NSObject

/**
 * Detect list marker in a line of text
 *
 * @param line The text line to analyze
 * @return Marker information including type and content
 */
+ (LynxListMarkerInfo *)detectMarkerInLine:(NSString *)line;

/**
 * Generate marker for a list type
 *
 * @param listType The type of list
 * @param number The number for ordered lists (ignored for other types)
 * @return The marker string (e.g., "• ", "1. ", "☐ ")
 */
+ (NSString *)markerForListType:(LynxListType)listType number:(NSInteger)number;

/**
 * Generate marker with indent
 *
 * @param listType The type of list
 * @param number The number for ordered lists (ignored for other types)
 * @param indentLevel Indent level (0 = no indent, 1 = 2 spaces, etc.)
 * @return The indented marker string
 */
+ (NSString *)markerForListType:(LynxListType)listType
                         number:(NSInteger)number
                    indentLevel:(NSInteger)indentLevel;

/**
 * Check if text starts with a bullet marker
 *
 * @param text The text to check
 * @return YES if text starts with "• "
 */
+ (BOOL)isBulletMarker:(NSString *)text;

/**
 * Check if text starts with an ordered list marker
 *
 * @param text The text to check
 * @param outNumber Pointer to store the extracted number (nullable)
 * @return YES if text starts with "N. " pattern
 */
+ (BOOL)isOrderedMarker:(NSString *)text number:(NSInteger * _Nullable)outNumber;

/**
 * Check if text starts with a task marker
 *
 * @param text The text to check
 * @param outChecked Pointer to store checked state (nullable)
 * @return YES if text starts with "☐ " or "☑ "
 */
+ (BOOL)isTaskMarker:(NSString *)text checked:(BOOL * _Nullable)outChecked;

/**
 * Check if text starts with a blockquote marker
 *
 * @param text The text to check
 * @return YES if text starts with "│ "
 */
+ (BOOL)isBlockquoteMarker:(NSString *)text;

/**
 * Remove marker prefix from text
 *
 * @param text The text containing a marker
 * @param markerInfo The marker information
 * @return Text with marker removed
 */
+ (NSString *)removeMarker:(NSString *)text markerInfo:(LynxListMarkerInfo *)markerInfo;

/**
 * Add marker prefix to text
 *
 * @param text The text to add marker to
 * @param listType The type of list marker to add
 * @param number The number for ordered lists
 * @return Text with marker added
 */
+ (NSString *)addMarker:(NSString *)text listType:(LynxListType)listType number:(NSInteger)number;

/**
 * Calculate indent level from text
 *
 * @param text The text to analyze
 * @return Number of 2-space indents (0 = no indent, 1 = 2 spaces, etc.)
 */
+ (NSInteger)indentLevelFromText:(NSString *)text;

/**
 * Get indent string for level
 *
 * @param level The indent level (0 = no indent, 1 = 2 spaces, etc.)
 * @return The indent string (empty, "  ", "    ", etc.)
 */
+ (NSString *)indentStringForLevel:(NSInteger)level;

@end

NS_ASSUME_NONNULL_END
