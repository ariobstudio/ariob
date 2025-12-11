// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

#import "LynxTextListHelper.h"

@implementation LynxListContinuationResult
@end

@implementation LynxListToggleResult
@end

@implementation LynxListConversionResult
@end

@implementation LynxTextListHelper

#pragma mark - List Continuation

+ (LynxListContinuationResult *)calculateListContinuation:(NSString *)paragraphText {
    LynxListContinuationResult *result = [[LynxListContinuationResult alloc] init];
    result.shouldContinue = NO;
    result.shouldExit = NO;
    result.markerToInsert = nil;
    result.listType = LynxListTypeNone;

    // Trim trailing newline for accurate detection
    NSString *cleanText = paragraphText;
    if ([cleanText hasSuffix:@"\n"]) {
        cleanText = [cleanText substringToIndex:cleanText.length - 1];
    }

    // Detect list marker
    LynxListMarkerInfo *markerInfo = [LynxTextListMarker detectMarkerInLine:cleanText];

    // Not in a list
    if (!markerInfo.hasMarker) {
        return result;
    }

    result.listType = markerInfo.listType;

    // Check if list item is empty (just the marker with no content)
    NSString *content = markerInfo.contentAfterMarker;
    BOOL isEmpty = !content || [content stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceCharacterSet]].length == 0;

    if (isEmpty) {
        // Empty list item - exit the list
        result.shouldExit = YES;
        result.shouldContinue = NO;
        return result;
    }

    // List item has content - continue the list
    result.shouldContinue = YES;
    result.shouldExit = NO;

    // Generate the marker for the next line
    switch (markerInfo.listType) {
        case LynxListTypeBullet:
            result.markerToInsert = @"• ";
            break;

        case LynxListTypeOrdered: {
            NSInteger nextNumber = markerInfo.currentNumber + 1;
            result.markerToInsert = [LynxTextListMarker markerForListType:LynxListTypeOrdered
                                                                   number:nextNumber];
            break;
        }

        case LynxListTypeTask:
            result.markerToInsert = @"☐ ";
            break;

        case LynxListTypeBlockquote:
            result.markerToInsert = @"│ ";
            break;

        case LynxListTypeNone:
        default:
            result.markerToInsert = nil;
            break;
    }

    return result;
}

+ (NSRange)applyListContinuation:(NSMutableAttributedString *)attrString
                         atRange:(NSRange)range
                  paragraphRange:(NSRange)paragraphRange
                          result:(LynxListContinuationResult *)result
                      attributes:(NSDictionary *)attributes {

    if (result.shouldExit) {
        // Remove the marker from the current line
        LynxListMarkerInfo *markerInfo = [LynxTextListMarker detectMarkerInLine:attrString.string];
        if (markerInfo.hasMarker) {
            NSRange markerRange = NSMakeRange(paragraphRange.location, markerInfo.markerLength);
            [attrString replaceCharactersInRange:markerRange withString:@""];

            // Position cursor at start of now-empty line
            return NSMakeRange(paragraphRange.location, 0);
        }
        return range;
    }

    if (result.shouldContinue && result.markerToInsert) {
        // Insert newline + list marker
        NSString *insertionText = [@"\n" stringByAppendingString:result.markerToInsert];
        NSAttributedString *insertionAttrString = [[NSAttributedString alloc] initWithString:insertionText
                                                                                  attributes:attributes];
        [attrString insertAttributedString:insertionAttrString atIndex:range.location];

        // Position cursor after the marker
        return NSMakeRange(range.location + insertionText.length, 0);
    }

    return range;
}

#pragma mark - Block Format Clearing

+ (NSString *)clearBlockMarkers:(NSString *)paragraphText {
    if (!paragraphText || paragraphText.length == 0) {
        return paragraphText;
    }

    // Detect and remove any block-level marker
    LynxListMarkerInfo *markerInfo = [LynxTextListMarker detectMarkerInLine:paragraphText];

    if (markerInfo.hasMarker) {
        // Return text without the marker
        return markerInfo.contentAfterMarker;
    }

    // No marker found, return original
    return paragraphText;
}

#pragma mark - List Toggle Operations

+ (LynxListToggleResult *)toggleBulletList:(NSString *)paragraphText {
    LynxListToggleResult *result = [[LynxListToggleResult alloc] init];
    result.success = YES;

    LynxListMarkerInfo *markerInfo = [LynxTextListMarker detectMarkerInLine:paragraphText];

    if (markerInfo.hasMarker && markerInfo.listType == LynxListTypeBullet) {
        // Remove bullet marker
        result.resultText = markerInfo.contentAfterMarker;
        result.cursorAdjustment = -2; // Length of "• "
        result.wasRemoved = YES;
    } else {
        // Clear any existing block markers (ordered list, blockquote, etc.)
        NSString *cleanText = [self clearBlockMarkers:paragraphText];
        NSInteger markerRemoved = paragraphText.length - cleanText.length;

        // Add bullet marker
        result.resultText = [@"• " stringByAppendingString:cleanText];
        result.cursorAdjustment = 2 - markerRemoved;
        result.wasRemoved = NO;
    }

    return result;
}

+ (LynxListToggleResult *)toggleOrderedList:(NSString *)paragraphText {
    LynxListToggleResult *result = [[LynxListToggleResult alloc] init];
    result.success = YES;

    LynxListMarkerInfo *markerInfo = [LynxTextListMarker detectMarkerInLine:paragraphText];

    if (markerInfo.hasMarker && markerInfo.listType == LynxListTypeOrdered) {
        // Remove ordered list marker
        result.resultText = markerInfo.contentAfterMarker;
        result.cursorAdjustment = -(NSInteger)markerInfo.markerLength;
        result.wasRemoved = YES;
    } else {
        // Clear any existing block markers (bullet list, blockquote, etc.)
        NSString *cleanText = [self clearBlockMarkers:paragraphText];
        NSInteger markerRemoved = paragraphText.length - cleanText.length;

        // Add ordered list marker
        result.resultText = [@"1. " stringByAppendingString:cleanText];
        result.cursorAdjustment = 3 - markerRemoved;
        result.wasRemoved = NO;
    }

    return result;
}

+ (LynxListToggleResult *)toggleBlockquote:(NSString *)paragraphText {
    LynxListToggleResult *result = [[LynxListToggleResult alloc] init];
    result.success = YES;

    LynxListMarkerInfo *markerInfo = [LynxTextListMarker detectMarkerInLine:paragraphText];

    if (markerInfo.hasMarker && markerInfo.listType == LynxListTypeBlockquote) {
        // Remove blockquote marker
        result.resultText = markerInfo.contentAfterMarker;
        result.cursorAdjustment = -2;
        result.wasRemoved = YES;
    } else {
        // Clear any existing block markers (lists, etc.)
        NSString *cleanText = [self clearBlockMarkers:paragraphText];
        NSInteger markerRemoved = paragraphText.length - cleanText.length;

        // Add blockquote marker
        result.resultText = [@"│ " stringByAppendingString:cleanText];
        result.cursorAdjustment = 2 - markerRemoved;
        result.wasRemoved = NO;
    }

    return result;
}

#pragma mark - List Type Conversion

+ (LynxListConversionResult *)convertListType:(NSString *)paragraphText {
    LynxListConversionResult *result = [[LynxListConversionResult alloc] init];
    result.success = NO;

    LynxListMarkerInfo *markerInfo = [LynxTextListMarker detectMarkerInLine:paragraphText];

    // Can only convert if in a list (not blockquote)
    if (!markerInfo.hasMarker || markerInfo.listType == LynxListTypeBlockquote) {
        return result;
    }

    result.fromType = markerInfo.listType;

    // Convert based on current type
    if (markerInfo.listType == LynxListTypeBullet) {
        // Convert bullet to ordered
        return [self convertBulletToOrdered:paragraphText number:1];
    } else if (markerInfo.listType == LynxListTypeOrdered) {
        // Convert ordered to bullet
        return [self convertOrderedToBullet:paragraphText];
    }
    // Task lists not implemented for conversion yet
    return result;
}

+ (LynxListConversionResult *)convertBulletToOrdered:(NSString *)paragraphText
                                              number:(NSInteger)number {
    LynxListConversionResult *result = [[LynxListConversionResult alloc] init];
    result.success = NO;

    LynxListMarkerInfo *markerInfo = [LynxTextListMarker detectMarkerInLine:paragraphText];

    if (!markerInfo.hasMarker || markerInfo.listType != LynxListTypeBullet) {
        return result;
    }

    result.success = YES;
    result.fromType = LynxListTypeBullet;
    result.toType = LynxListTypeOrdered;

    NSString *orderedMarker = [LynxTextListMarker markerForListType:LynxListTypeOrdered
                                                             number:number];
    result.resultText = [orderedMarker stringByAppendingString:markerInfo.contentAfterMarker];

    // Calculate cursor adjustment (difference in marker length)
    result.cursorAdjustment = (NSInteger)orderedMarker.length - (NSInteger)markerInfo.markerLength;

    return result;
}

+ (LynxListConversionResult *)convertOrderedToBullet:(NSString *)paragraphText {
    LynxListConversionResult *result = [[LynxListConversionResult alloc] init];
    result.success = NO;

    LynxListMarkerInfo *markerInfo = [LynxTextListMarker detectMarkerInLine:paragraphText];

    if (!markerInfo.hasMarker || markerInfo.listType != LynxListTypeOrdered) {
        return result;
    }

    result.success = YES;
    result.fromType = LynxListTypeOrdered;
    result.toType = LynxListTypeBullet;

    NSString *bulletMarker = @"• ";
    result.resultText = [bulletMarker stringByAppendingString:markerInfo.contentAfterMarker];

    // Calculate cursor adjustment
    result.cursorAdjustment = (NSInteger)bulletMarker.length - (NSInteger)markerInfo.markerLength;

    return result;
}

#pragma mark - Indentation

+ (NSString *)indentParagraph:(NSString *)paragraphText {
    return [@"  " stringByAppendingString:paragraphText];
}

+ (NSString *)outdentParagraph:(NSString *)paragraphText success:(BOOL *)outSuccess {
    BOOL canOutdent = [self canOutdentParagraph:paragraphText];

    if (outSuccess) {
        *outSuccess = canOutdent;
    }

    if (!canOutdent) {
        return paragraphText;
    }

    // Remove 2 spaces from beginning
    return [paragraphText substringFromIndex:2];
}

+ (BOOL)canOutdentParagraph:(NSString *)paragraphText {
    return paragraphText && [paragraphText hasPrefix:@"  "];
}

#pragma mark - Line Movement

+ (BOOL)swapLines:(NSMutableAttributedString *)attrString
           range1:(NSRange)range1
           range2:(NSRange)range2 {

    if (range1.location == NSNotFound || range2.location == NSNotFound) {
        return NO;
    }

    NSString *fullText = attrString.string;

    if (NSMaxRange(range1) > fullText.length || NSMaxRange(range2) > fullText.length) {
        return NO;
    }

    NSString *text1 = [fullText substringWithRange:range1];
    NSString *text2 = [fullText substringWithRange:range2];

    // Determine order (swap higher range first to avoid index issues)
    NSRange firstRange = range1.location < range2.location ? range2 : range1;
    NSRange secondRange = range1.location < range2.location ? range1 : range2;
    NSString *firstText = range1.location < range2.location ? text2 : text1;
    NSString *secondText = range1.location < range2.location ? text1 : text2;

    // Replace higher range first
    [attrString replaceCharactersInRange:firstRange withString:firstText];
    // Then replace lower range
    [attrString replaceCharactersInRange:secondRange withString:secondText];

    return YES;
}

+ (NSRange)adjustSelectionAfterSwap:(NSRange)currentSelection
                   currentLineRange:(NSRange)currentLineRange
                    targetLineRange:(NSRange)targetLineRange
                          movingUp:(BOOL)movingUp {

    // Calculate offset within the current line
    NSInteger offsetInLine = currentSelection.location - currentLineRange.location;

    // New position is target line start + offset
    NSInteger newLocation = targetLineRange.location + offsetInLine;

    return NSMakeRange(newLocation, currentSelection.length);
}

@end
