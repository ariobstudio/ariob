// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

#import "LynxTextListMarker.h"

@implementation LynxListMarkerInfo
@end

@implementation LynxTextListMarker

#pragma mark - Marker Detection

+ (LynxListMarkerInfo *)detectMarkerInLine:(NSString *)line {
    LynxListMarkerInfo *info = [[LynxListMarkerInfo alloc] init];
    info.hasMarker = NO;
    info.listType = LynxListTypeNone;
    info.marker = @"";
    info.markerLength = 0;
    info.contentAfterMarker = line;
    info.currentNumber = 0;

    if (!line || line.length == 0) {
        return info;
    }

    // Check for bullet list: "• "
    if ([self isBulletMarker:line]) {
        info.hasMarker = YES;
        info.listType = LynxListTypeBullet;
        info.marker = @"• ";
        info.markerLength = 2;
        info.contentAfterMarker = [line substringFromIndex:2];
        return info;
    }

    // Check for task list: "☐ " or "☑ "
    BOOL checked = NO;
    if ([self isTaskMarker:line checked:&checked]) {
        info.hasMarker = YES;
        info.listType = LynxListTypeTask;
        info.marker = checked ? @"☑ " : @"☐ ";
        info.markerLength = 2;
        info.contentAfterMarker = [line substringFromIndex:2];
        return info;
    }

    // Check for blockquote: "│ "
    if ([self isBlockquoteMarker:line]) {
        info.hasMarker = YES;
        info.listType = LynxListTypeBlockquote;
        info.marker = @"│ ";
        info.markerLength = 2;
        info.contentAfterMarker = [line substringFromIndex:2];
        return info;
    }

    // Check for ordered list: "N. "
    NSInteger number = 0;
    if ([self isOrderedMarker:line number:&number]) {
        NSString *numberStr = [NSString stringWithFormat:@"%ld", (long)number];
        NSString *marker = [NSString stringWithFormat:@"%@. ", numberStr];

        info.hasMarker = YES;
        info.listType = LynxListTypeOrdered;
        info.marker = marker;
        info.markerLength = marker.length;
        info.currentNumber = number;
        info.contentAfterMarker = [line substringFromIndex:marker.length];
        return info;
    }

    return info;
}

+ (NSString *)markerForListType:(LynxListType)listType number:(NSInteger)number {
    return [self markerForListType:listType number:number indentLevel:0];
}

+ (NSString *)markerForListType:(LynxListType)listType
                         number:(NSInteger)number
                    indentLevel:(NSInteger)indentLevel {
    NSString *indent = [self indentStringForLevel:indentLevel];
    NSString *marker = @"";

    switch (listType) {
        case LynxListTypeBullet:
            marker = @"• ";
            break;

        case LynxListTypeOrdered:
            marker = [NSString stringWithFormat:@"%ld. ", (long)number];
            break;

        case LynxListTypeTask:
            marker = @"☐ ";
            break;

        case LynxListTypeBlockquote:
            marker = @"│ ";
            break;

        case LynxListTypeNone:
        default:
            marker = @"";
            break;
    }

    return [indent stringByAppendingString:marker];
}

#pragma mark - Marker Type Checks

+ (BOOL)isBulletMarker:(NSString *)text {
    return text && [text hasPrefix:@"• "];
}

+ (BOOL)isOrderedMarker:(NSString *)text number:(NSInteger *)outNumber {
    if (!text || text.length == 0) {
        return NO;
    }

    NSRegularExpression *regex = [NSRegularExpression regularExpressionWithPattern:@"^(\\d+)\\. "
                                                                           options:0
                                                                             error:nil];
    NSTextCheckingResult *match = [regex firstMatchInString:text
                                                    options:0
                                                      range:NSMakeRange(0, text.length)];

    if (match) {
        if (outNumber) {
            NSString *numberStr = [text substringWithRange:[match rangeAtIndex:1]];
            *outNumber = [numberStr integerValue];
        }
        return YES;
    }

    return NO;
}

+ (BOOL)isTaskMarker:(NSString *)text checked:(BOOL *)outChecked {
    if (!text || text.length < 2) {
        return NO;
    }

    if ([text hasPrefix:@"☐ "]) {
        if (outChecked) {
            *outChecked = NO;
        }
        return YES;
    }

    if ([text hasPrefix:@"☑ "]) {
        if (outChecked) {
            *outChecked = YES;
        }
        return YES;
    }

    return NO;
}

+ (BOOL)isBlockquoteMarker:(NSString *)text {
    return text && [text hasPrefix:@"│ "];
}

#pragma mark - Text Manipulation

+ (NSString *)removeMarker:(NSString *)text markerInfo:(LynxListMarkerInfo *)markerInfo {
    if (!markerInfo.hasMarker || markerInfo.markerLength == 0) {
        return text;
    }

    if (text.length < markerInfo.markerLength) {
        return text;
    }

    return [text substringFromIndex:markerInfo.markerLength];
}

+ (NSString *)addMarker:(NSString *)text listType:(LynxListType)listType number:(NSInteger)number {
    NSString *marker = [self markerForListType:listType number:number];
    return [marker stringByAppendingString:text];
}

#pragma mark - Indent Helpers

+ (NSInteger)indentLevelFromText:(NSString *)text {
    if (!text || text.length == 0) {
        return 0;
    }

    NSInteger spaceCount = 0;
    for (NSInteger i = 0; i < text.length; i++) {
        if ([text characterAtIndex:i] == ' ') {
            spaceCount++;
        } else {
            break;
        }
    }

    // Each indent level is 2 spaces
    return spaceCount / 2;
}

+ (NSString *)indentStringForLevel:(NSInteger)level {
    if (level <= 0) {
        return @"";
    }

    // Each level is 2 spaces
    return [@"" stringByPaddingToLength:(level * 2)
                             withString:@" "
                        startingAtIndex:0];
}

@end
