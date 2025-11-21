// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

#import "LynxRichTextInput.h"
#import "LynxTextListHelper.h"
#import "LynxTextListMarker.h"
#import <Lynx/LynxComponentRegistry.h>
#import <Lynx/LynxPropsProcessor.h>
#import <Lynx/LynxUIMethodProcessor.h>
#import <Lynx/LynxUIOwner.h>

// Custom attribute keys for list metadata
static NSString *const LynxListTypeAttributeName = @"LynxListType";
static NSString *const LynxListIndexAttributeName = @"LynxListIndex";
static NSString *const LynxListDepthAttributeName = @"LynxListDepth";

@interface LynxRichTextInput ()
@property(nonatomic, strong) UITextView *textView;
@property(nonatomic, assign) NSRange previousSelection;
@property(nonatomic, assign) BOOL suppressEvents;
@property(nonatomic, strong) NSDictionary *currentDocumentJSON;
@end

@implementation LynxRichTextInput

- (UITextView *)createView {
    NSLog(@"[LynxRichTextInput] createView called");
    UITextView *textView = [[UITextView alloc] init];
    textView.delegate = self;
    textView.editable = YES;
    textView.scrollEnabled = YES;
    textView.font = [UIFont systemFontOfSize:16];
    textView.textColor = [UIColor labelColor];
    textView.backgroundColor = [UIColor whiteColor]; // Make it visible
    textView.textContainerInset = UIEdgeInsetsMake(8, 8, 8, 8);
    textView.textContainer.lineFragmentPadding = 0;

    self.previousSelection = NSMakeRange(0, 0);
    self.suppressEvents = NO;
    self.textView = textView;

    NSLog(@"[LynxRichTextInput] UITextView created: %@", textView);
    return textView;
}

LYNX_PROP_SETTER("documentJSON", setDocumentJSON, NSString *) {
    NSLog(@"[LynxRichTextInput] setDocumentJSON called with value: %@", value ? @"<value present>" : @"<nil>");

    if (!value) {
        NSLog(@"[LynxRichTextInput] No documentJSON provided");
        return;
    }

    NSData *data = [value dataUsingEncoding:NSUTF8StringEncoding];
    NSError *error = nil;
    NSDictionary *json = [NSJSONSerialization JSONObjectWithData:data options:0 error:&error];

    if (error || !json) {
        NSLog(@"[LynxRichTextInput] Failed to parse documentJSON: %@", error);
        NSLog(@"[LynxRichTextInput] JSON string was: %@", value);
        return;
    }

    NSLog(@"[LynxRichTextInput] Successfully parsed JSON: %@", json);
    self.currentDocumentJSON = json;
    self.suppressEvents = YES;

    NSAttributedString *attributedString = [self documentToAttributedString:json];
    NSLog(@"[LynxRichTextInput] Generated attributed string with length: %lu", (unsigned long)attributedString.length);

    self.textView.attributedText = attributedString;

    // Suppress events for longer to avoid update loops
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.2 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        self.suppressEvents = NO;
        NSLog(@"[LynxRichTextInput] suppressEvents = NO (re-enabled)");
    });
}

LYNX_PROP_SETTER("editable", setEditable, BOOL) {
    self.textView.editable = value;
}

LYNX_UI_METHOD(focus) {
    callback([self.textView becomeFirstResponder] ? kUIMethodSuccess : kUIMethodUnknown, nil);
}

LYNX_UI_METHOD(blur) {
    callback([self.textView resignFirstResponder] ? kUIMethodSuccess : kUIMethodUnknown, nil);
}

#pragma mark - Formatting Commands

LYNX_UI_METHOD(toggleHeading) {
    NSInteger level = [params[@"level"] integerValue];
    NSLog(@"[LynxRichTextInput] toggleHeading called with level: %ld", (long)level);

    if (level < 1 || level > 6) {
        NSLog(@"[LynxRichTextInput] Invalid heading level: %ld", (long)level);
        callback(kUIMethodParamInvalid, @{@"error": @"Invalid heading level"});
        return;
    }

    NSRange sel = self.textView.selectedRange;
    NSMutableAttributedString *attrString = [[NSMutableAttributedString alloc] initWithAttributedString:self.textView.attributedText];
    NSString *fullText = attrString.string;

    // Find the paragraph range containing the selection/cursor
    NSRange paragraphRange = [fullText paragraphRangeForRange:sel];
    NSString *paragraphText = [fullText substringWithRange:paragraphRange];

    NSLog(@"[LynxRichTextInput] Selection: %lu-%lu, Paragraph range: %lu-%lu",
          (unsigned long)sel.location, (unsigned long)(sel.location + sel.length),
          (unsigned long)paragraphRange.location, (unsigned long)(paragraphRange.location + paragraphRange.length));

    // Check current formatting at paragraph start
    NSDictionary *currentAttrs = [attrString attributesAtIndex:paragraphRange.location effectiveRange:NULL];
    UIFont *currentFont = currentAttrs[NSFontAttributeName] ?: [UIFont systemFontOfSize:16];

    CGFloat targetSize = [@[@32, @24, @20, @18, @16, @14][level - 1] floatValue];
    BOOL isBold = (currentFont.fontDescriptor.symbolicTraits & UIFontDescriptorTraitBold) != 0;
    BOOL isAlreadyThisHeading = (fabs(currentFont.pointSize - targetSize) < 1.0) && isBold;

    NSLog(@"[LynxRichTextInput] Current font: %.1fpt, bold: %d, target: %.1fpt, already heading: %d",
          currentFont.pointSize, isBold, targetSize, isAlreadyThisHeading);

    UIFont *newFont;
    NSInteger cursorAdjustment = 0;

    if (isAlreadyThisHeading) {
        // Toggle off: revert to paragraph
        newFont = [UIFont systemFontOfSize:16];
        NSLog(@"[LynxRichTextInput] Reverting to paragraph");
    } else {
        // Toggle on: apply heading
        // First, clear any block markers (lists, blockquotes)
        NSString *cleanText = [LynxTextListHelper clearBlockMarkers:paragraphText];
        NSInteger markerLength = paragraphText.length - cleanText.length;

        if (markerLength > 0) {
            NSLog(@"[LynxRichTextInput] Removing %ld characters of block markers", (long)markerLength);
            [attrString replaceCharactersInRange:paragraphRange withString:cleanText];
            paragraphRange = NSMakeRange(paragraphRange.location, cleanText.length);
            cursorAdjustment = -markerLength;
        }

        newFont = [UIFont boldSystemFontOfSize:targetSize];
        NSLog(@"[LynxRichTextInput] Applying heading level %ld", (long)level);
    }

    // Apply font to entire paragraph
    [attrString addAttribute:NSFontAttributeName value:newFont range:paragraphRange];

    // Also clear any blockquote styling
    [attrString addAttribute:NSBackgroundColorAttributeName value:[UIColor clearColor] range:paragraphRange];

    // Adjust cursor position if markers were removed
    NSRange newSel = NSMakeRange(sel.location + cursorAdjustment, sel.length);
    if (newSel.location < paragraphRange.location) {
        newSel.location = paragraphRange.location;
    }

    self.suppressEvents = YES;
    self.textView.attributedText = attrString;
    self.textView.selectedRange = newSel;

    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.5 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        self.suppressEvents = NO;
        NSLog(@"[LynxRichTextInput] Heading toggle completed");
    });

    callback(kUIMethodSuccess, nil);
}

LYNX_UI_METHOD(toggleBold) {
    NSRange sel = self.textView.selectedRange;
    NSLog(@"[LynxRichTextInput] toggleBold called, selection: %lu-%lu", (unsigned long)sel.location, (unsigned long)(sel.location + sel.length));

    if (sel.length == 0) {
        NSLog(@"[LynxRichTextInput] No text selected");
        callback(kUIMethodParamInvalid, @{@"error": @"No text selected"});
        return;
    }

    NSMutableAttributedString *attrString = [[NSMutableAttributedString alloc] initWithAttributedString:self.textView.attributedText];

    // Check if already bold (with bounds checking)
    if (sel.location >= attrString.length) {
        NSLog(@"[LynxRichTextInput] Selection out of bounds");
        callback(kUIMethodParamInvalid, @{@"error": @"Selection out of bounds"});
        return;
    }

    NSDictionary *attrs = [attrString attributesAtIndex:sel.location effectiveRange:NULL];
    UIFont *currentFont = attrs[NSFontAttributeName] ?: [UIFont systemFontOfSize:16];
    UIFontDescriptorSymbolicTraits traits = currentFont.fontDescriptor.symbolicTraits;

    BOOL isBold = traits & UIFontDescriptorTraitBold;
    NSLog(@"[LynxRichTextInput] Current bold state: %d", isBold);

    if (isBold) {
        // Remove bold
        traits &= ~UIFontDescriptorTraitBold;
    } else {
        // Add bold
        traits |= UIFontDescriptorTraitBold;
    }

    UIFontDescriptor *descriptor = [[currentFont fontDescriptor] fontDescriptorWithSymbolicTraits:traits];
    UIFont *newFont = [UIFont fontWithDescriptor:descriptor size:currentFont.pointSize];

    [attrString addAttribute:NSFontAttributeName value:newFont range:sel];

    self.suppressEvents = YES;
    self.textView.attributedText = attrString;
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.5 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        self.suppressEvents = NO;
        NSLog(@"[LynxRichTextInput] Bold toggled successfully");
    });

    callback(kUIMethodSuccess, nil);
}

LYNX_UI_METHOD(toggleItalic) {
    NSRange sel = self.textView.selectedRange;
    NSLog(@"[LynxRichTextInput] toggleItalic called, selection: %lu-%lu", (unsigned long)sel.location, (unsigned long)(sel.location + sel.length));

    if (sel.length == 0) {
        NSLog(@"[LynxRichTextInput] No text selected");
        callback(kUIMethodParamInvalid, @{@"error": @"No text selected"});
        return;
    }

    NSMutableAttributedString *attrString = [[NSMutableAttributedString alloc] initWithAttributedString:self.textView.attributedText];

    // Bounds checking
    if (sel.location >= attrString.length) {
        NSLog(@"[LynxRichTextInput] Selection out of bounds");
        callback(kUIMethodParamInvalid, @{@"error": @"Selection out of bounds"});
        return;
    }

    NSDictionary *attrs = [attrString attributesAtIndex:sel.location effectiveRange:NULL];
    UIFont *currentFont = attrs[NSFontAttributeName] ?: [UIFont systemFontOfSize:16];
    UIFontDescriptorSymbolicTraits traits = currentFont.fontDescriptor.symbolicTraits;

    BOOL isItalic = traits & UIFontDescriptorTraitItalic;
    NSLog(@"[LynxRichTextInput] Current italic state: %d", isItalic);

    if (isItalic) {
        traits &= ~UIFontDescriptorTraitItalic;
    } else {
        traits |= UIFontDescriptorTraitItalic;
    }

    UIFontDescriptor *descriptor = [[currentFont fontDescriptor] fontDescriptorWithSymbolicTraits:traits];
    UIFont *newFont = [UIFont fontWithDescriptor:descriptor size:currentFont.pointSize];

    [attrString addAttribute:NSFontAttributeName value:newFont range:sel];

    self.suppressEvents = YES;
    self.textView.attributedText = attrString;
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.5 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        self.suppressEvents = NO;
        NSLog(@"[LynxRichTextInput] Italic toggled successfully");
    });

    callback(kUIMethodSuccess, nil);
}

LYNX_UI_METHOD(toggleBulletList) {
    NSLog(@"[LynxRichTextInput] toggleBulletList called");

    NSRange sel = self.textView.selectedRange;
    NSMutableAttributedString *attrString = [[NSMutableAttributedString alloc] initWithAttributedString:self.textView.attributedText];
    NSString *fullText = attrString.string;

    // Find the paragraph range containing the selection/cursor
    NSRange paragraphRange = [fullText paragraphRangeForRange:sel];
    NSString *paragraphText = [fullText substringWithRange:paragraphRange];

    NSLog(@"[LynxRichTextInput] Paragraph text: '%@'", paragraphText);

    // Use helper to toggle bullet list
    LynxListToggleResult *result = [LynxTextListHelper toggleBulletList:paragraphText];

    NSLog(@"[LynxRichTextInput] %@ bullet list", result.wasRemoved ? @"Removing" : @"Adding");

    // Replace paragraph text
    [attrString replaceCharactersInRange:paragraphRange withString:result.resultText];

    // Adjust cursor position
    NSRange newSel = NSMakeRange(sel.location + result.cursorAdjustment, sel.length);
    // Ensure cursor stays within bounds
    if (newSel.location < paragraphRange.location) {
        newSel.location = paragraphRange.location;
    }

    self.suppressEvents = YES;
    self.textView.attributedText = attrString;
    self.textView.selectedRange = newSel;

    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.5 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        self.suppressEvents = NO;
        NSLog(@"[LynxRichTextInput] Bullet list toggled");
    });

    callback(kUIMethodSuccess, nil);
}

LYNX_UI_METHOD(toggleOrderedList) {
    NSLog(@"[LynxRichTextInput] toggleOrderedList called");

    NSRange sel = self.textView.selectedRange;
    NSMutableAttributedString *attrString = [[NSMutableAttributedString alloc] initWithAttributedString:self.textView.attributedText];
    NSString *fullText = attrString.string;

    // Find the paragraph range containing the selection/cursor
    NSRange paragraphRange = [fullText paragraphRangeForRange:sel];
    NSString *paragraphText = [fullText substringWithRange:paragraphRange];

    NSLog(@"[LynxRichTextInput] Paragraph text: '%@'", paragraphText);

    // Use helper to toggle ordered list
    LynxListToggleResult *result = [LynxTextListHelper toggleOrderedList:paragraphText];

    NSLog(@"[LynxRichTextInput] %@ ordered list", result.wasRemoved ? @"Removing" : @"Adding");

    // Replace paragraph text
    [attrString replaceCharactersInRange:paragraphRange withString:result.resultText];

    // Adjust cursor position
    NSRange newSel = NSMakeRange(sel.location + result.cursorAdjustment, sel.length);
    if (newSel.location < paragraphRange.location) {
        newSel.location = paragraphRange.location;
    }

    self.suppressEvents = YES;
    self.textView.attributedText = attrString;
    self.textView.selectedRange = newSel;

    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.5 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        self.suppressEvents = NO;
        NSLog(@"[LynxRichTextInput] Ordered list toggled");
    });

    callback(kUIMethodSuccess, nil);
}

LYNX_UI_METHOD(toggleBlockquote) {
    NSLog(@"[LynxRichTextInput] toggleBlockquote called");

    NSRange sel = self.textView.selectedRange;
    NSMutableAttributedString *attrString = [[NSMutableAttributedString alloc] initWithAttributedString:self.textView.attributedText];
    NSString *fullText = attrString.string;

    // Find the paragraph range containing the selection/cursor
    NSRange paragraphRange = [fullText paragraphRangeForRange:sel];
    NSString *paragraphText = [fullText substringWithRange:paragraphRange];

    NSLog(@"[LynxRichTextInput] Paragraph text: '%@'", paragraphText);

    // Use helper to toggle blockquote
    LynxListToggleResult *result = [LynxTextListHelper toggleBlockquote:paragraphText];

    NSLog(@"[LynxRichTextInput] %@ blockquote", result.wasRemoved ? @"Removing" : @"Adding");

    // Replace paragraph text
    [attrString replaceCharactersInRange:paragraphRange withString:result.resultText];

    // Apply/remove blockquote styling (gray background and italic)
    NSRange newParagraphRange = NSMakeRange(paragraphRange.location, result.resultText.length);

    if (!result.wasRemoved) {
        // Apply blockquote styling
        NSDictionary *blockquoteAttrs = @{
            NSBackgroundColorAttributeName: [UIColor systemGray6Color],
            NSFontAttributeName: [UIFont italicSystemFontOfSize:16]
        };
        [attrString addAttributes:blockquoteAttrs range:newParagraphRange];
        NSLog(@"[LynxRichTextInput] Applied blockquote styling");
    } else {
        // Remove blockquote styling (reset to normal)
        [attrString addAttribute:NSBackgroundColorAttributeName value:[UIColor clearColor] range:newParagraphRange];
        [attrString addAttribute:NSFontAttributeName value:[UIFont systemFontOfSize:16] range:newParagraphRange];
        NSLog(@"[LynxRichTextInput] Removed blockquote styling");
    }

    // Adjust cursor position
    NSRange newSel = NSMakeRange(sel.location + result.cursorAdjustment, sel.length);
    if (newSel.location < paragraphRange.location) {
        newSel.location = paragraphRange.location;
    }

    self.suppressEvents = YES;
    self.textView.attributedText = attrString;
    self.textView.selectedRange = newSel;

    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.5 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        self.suppressEvents = NO;
        NSLog(@"[LynxRichTextInput] Blockquote toggled");
    });

    callback(kUIMethodSuccess, nil);
}

LYNX_UI_METHOD(indentListItem) {
    NSLog(@"[LynxRichTextInput] indentListItem called");

    NSRange sel = self.textView.selectedRange;
    NSMutableAttributedString *attrString = [[NSMutableAttributedString alloc] initWithAttributedString:self.textView.attributedText];
    NSString *fullText = attrString.string;

    // Find the paragraph range containing the selection/cursor
    NSRange paragraphRange = [fullText paragraphRangeForRange:sel];
    NSString *paragraphText = [fullText substringWithRange:paragraphRange];

    NSLog(@"[LynxRichTextInput] Paragraph text: '%@'", paragraphText);

    // Use helper to indent paragraph
    NSString *newParagraphText = [LynxTextListHelper indentParagraph:paragraphText];

    // Replace paragraph text
    [attrString replaceCharactersInRange:paragraphRange withString:newParagraphText];

    // Adjust cursor position
    NSRange newSel = NSMakeRange(sel.location + 2, sel.length);

    self.suppressEvents = YES;
    self.textView.attributedText = attrString;
    self.textView.selectedRange = newSel;

    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.2 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        self.suppressEvents = NO;
        NSLog(@"[LynxRichTextInput] List item indented");
    });

    callback(kUIMethodSuccess, nil);
}

LYNX_UI_METHOD(outdentListItem) {
    NSLog(@"[LynxRichTextInput] outdentListItem called");

    NSRange sel = self.textView.selectedRange;
    NSMutableAttributedString *attrString = [[NSMutableAttributedString alloc] initWithAttributedString:self.textView.attributedText];
    NSString *fullText = attrString.string;

    // Find the paragraph range containing the selection/cursor
    NSRange paragraphRange = [fullText paragraphRangeForRange:sel];
    NSString *paragraphText = [fullText substringWithRange:paragraphRange];

    NSLog(@"[LynxRichTextInput] Paragraph text: '%@'", paragraphText);

    // Use helper to outdent paragraph
    BOOL success = NO;
    NSString *newParagraphText = [LynxTextListHelper outdentParagraph:paragraphText success:&success];

    if (!success) {
        NSLog(@"[LynxRichTextInput] Cannot outdent - no leading spaces");
        callback(kUIMethodUnknown, @{@"error": @"Cannot outdent"});
        return;
    }

    // Replace paragraph text
    [attrString replaceCharactersInRange:paragraphRange withString:newParagraphText];

    // Adjust cursor position
    NSRange newSel = NSMakeRange(sel.location - 2, sel.length);
    if (newSel.location < paragraphRange.location) {
        newSel.location = paragraphRange.location;
    }

    self.suppressEvents = YES;
    self.textView.attributedText = attrString;
    self.textView.selectedRange = newSel;

    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.2 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        self.suppressEvents = NO;
        NSLog(@"[LynxRichTextInput] List item outdented");
    });

    callback(kUIMethodSuccess, nil);
}

LYNX_UI_METHOD(toggleListType) {
    NSLog(@"[LynxRichTextInput] toggleListType called");

    NSRange sel = self.textView.selectedRange;
    NSMutableAttributedString *attrString = [[NSMutableAttributedString alloc] initWithAttributedString:self.textView.attributedText];
    NSString *fullText = attrString.string;

    // Find the paragraph range containing the selection/cursor
    NSRange currentParagraphRange = [fullText paragraphRangeForRange:sel];
    NSString *currentParagraphText = [fullText substringWithRange:currentParagraphRange];

    NSLog(@"[LynxRichTextInput] Current paragraph text: '%@'", currentParagraphText);

    // Detect current list type
    LynxListMarkerInfo *currentMarker = [LynxTextListMarker detectMarkerInLine:currentParagraphText];

    if (!currentMarker.hasMarker ||
        (currentMarker.listType != LynxListTypeBullet && currentMarker.listType != LynxListTypeOrdered)) {
        NSLog(@"[LynxRichTextInput] Not in a convertible list");
        callback(kUIMethodUnknown, @{@"error": @"Not in a toggleable list"});
        return;
    }

    LynxListType sourceType = currentMarker.listType;
    LynxListType targetType = (sourceType == LynxListTypeBullet) ? LynxListTypeOrdered : LynxListTypeBullet;

    NSLog(@"[LynxRichTextInput] Converting entire list block from %@ to %@",
          sourceType == LynxListTypeBullet ? @"bullet" : @"ordered",
          targetType == LynxListTypeBullet ? @"bullet" : @"ordered");

    // Find all consecutive lines with the same list type to form the list block
    NSMutableArray *listLineRanges = [NSMutableArray array];
    NSUInteger currentPos = currentParagraphRange.location;

    // Scan backward to find start of list block
    while (currentPos > 0) {
        NSRange prevLineRange = [fullText paragraphRangeForRange:NSMakeRange(currentPos - 1, 0)];
        NSString *prevLineText = [fullText substringWithRange:prevLineRange];
        LynxListMarkerInfo *prevMarker = [LynxTextListMarker detectMarkerInLine:prevLineText];

        if (prevMarker.hasMarker && prevMarker.listType == sourceType) {
            currentPos = prevLineRange.location;
        } else {
            break;
        }
    }

    NSUInteger listStartPos = currentPos;

    // Scan forward from list start to collect all lines in the list block
    currentPos = listStartPos;
    while (currentPos < fullText.length) {
        NSRange lineRange = [fullText paragraphRangeForRange:NSMakeRange(currentPos, 0)];
        NSString *lineText = [fullText substringWithRange:lineRange];
        LynxListMarkerInfo *lineMarker = [LynxTextListMarker detectMarkerInLine:lineText];

        if (lineMarker.hasMarker && lineMarker.listType == sourceType) {
            [listLineRanges addObject:[NSValue valueWithRange:lineRange]];
            currentPos = NSMaxRange(lineRange);
        } else {
            break;
        }
    }

    NSLog(@"[LynxRichTextInput] Found %lu lines in list block", (unsigned long)listLineRanges.count);

    // Convert all lines in the list block (iterate in reverse to maintain ranges)
    NSInteger cursorAdjustment = 0;
    NSInteger orderedNumber = 1;

    for (NSInteger i = listLineRanges.count - 1; i >= 0; i--) {
        NSRange lineRange = [listLineRanges[i] rangeValue];
        NSString *lineText = [fullText substringWithRange:lineRange];

        LynxListConversionResult *result;
        if (targetType == LynxListTypeOrdered) {
            // Convert to ordered list with sequential numbering
            NSInteger number = listLineRanges.count - i;
            result = [LynxTextListHelper convertBulletToOrdered:lineText number:number];
        } else {
            // Convert to bullet list
            result = [LynxTextListHelper convertOrderedToBullet:lineText];
        }

        if (result.success) {
            [attrString replaceCharactersInRange:lineRange withString:result.resultText];

            // Track cursor adjustment for the current line
            if (NSLocationInRange(sel.location, lineRange)) {
                cursorAdjustment = result.cursorAdjustment;
            }
        }

        // Update fullText for next iteration (only needed for display, not used in loop)
        fullText = attrString.string;
    }

    // Adjust cursor position
    NSRange newSel = NSMakeRange(sel.location + cursorAdjustment, sel.length);
    if (newSel.location < listStartPos) {
        newSel.location = listStartPos;
    }

    self.suppressEvents = YES;
    self.textView.attributedText = attrString;
    self.textView.selectedRange = newSel;

    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.2 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        self.suppressEvents = NO;
        NSLog(@"[LynxRichTextInput] List type toggled for entire block");
    });

    callback(kUIMethodSuccess, nil);
}

LYNX_UI_METHOD(moveListItemUp) {
    NSLog(@"[LynxRichTextInput] moveListItemUp called");

    NSRange sel = self.textView.selectedRange;
    NSMutableAttributedString *attrString = [[NSMutableAttributedString alloc] initWithAttributedString:self.textView.attributedText];
    NSString *fullText = attrString.string;

    // Find the paragraph range containing the selection/cursor
    NSRange currentParagraphRange = [fullText paragraphRangeForRange:sel];

    // Check if there's a previous line
    if (currentParagraphRange.location == 0) {
        NSLog(@"[LynxRichTextInput] Already at the first line");
        callback(kUIMethodUnknown, @{@"error": @"Already at first line"});
        return;
    }

    // Find the previous paragraph
    NSRange previousParagraphRange = [fullText paragraphRangeForRange:NSMakeRange(currentParagraphRange.location - 1, 0)];

    NSLog(@"[LynxRichTextInput] Swapping lines");

    // Use helper to swap lines
    BOOL success = [LynxTextListHelper swapLines:attrString
                                          range1:currentParagraphRange
                                          range2:previousParagraphRange];

    if (!success) {
        NSLog(@"[LynxRichTextInput] Failed to swap lines");
        callback(kUIMethodUnknown, @{@"error": @"Failed to move line"});
        return;
    }

    // Calculate new selection position
    NSRange newSel = [LynxTextListHelper adjustSelectionAfterSwap:sel
                                                 currentLineRange:currentParagraphRange
                                                  targetLineRange:previousParagraphRange
                                                        movingUp:YES];

    self.suppressEvents = YES;
    self.textView.attributedText = attrString;
    self.textView.selectedRange = newSel;

    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.2 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        self.suppressEvents = NO;
        NSLog(@"[LynxRichTextInput] List item moved up");
    });

    callback(kUIMethodSuccess, nil);
}

LYNX_UI_METHOD(moveListItemDown) {
    NSLog(@"[LynxRichTextInput] moveListItemDown called");

    NSRange sel = self.textView.selectedRange;
    NSMutableAttributedString *attrString = [[NSMutableAttributedString alloc] initWithAttributedString:self.textView.attributedText];
    NSString *fullText = attrString.string;

    // Find the paragraph range containing the selection/cursor
    NSRange currentParagraphRange = [fullText paragraphRangeForRange:sel];

    // Check if there's a next line
    NSUInteger nextLineStart = NSMaxRange(currentParagraphRange);
    if (nextLineStart >= fullText.length) {
        NSLog(@"[LynxRichTextInput] Already at the last line");
        callback(kUIMethodUnknown, @{@"error": @"Already at last line"});
        return;
    }

    // Find the next paragraph
    NSRange nextParagraphRange = [fullText paragraphRangeForRange:NSMakeRange(nextLineStart, 0)];

    NSLog(@"[LynxRichTextInput] Swapping lines");

    // Use helper to swap lines
    BOOL success = [LynxTextListHelper swapLines:attrString
                                          range1:currentParagraphRange
                                          range2:nextParagraphRange];

    if (!success) {
        NSLog(@"[LynxRichTextInput] Failed to swap lines");
        callback(kUIMethodUnknown, @{@"error": @"Failed to move line"});
        return;
    }

    // Calculate new selection position
    NSRange newSel = [LynxTextListHelper adjustSelectionAfterSwap:sel
                                                 currentLineRange:currentParagraphRange
                                                  targetLineRange:nextParagraphRange
                                                        movingUp:NO];

    self.suppressEvents = YES;
    self.textView.attributedText = attrString;
    self.textView.selectedRange = newSel;

    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.2 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        self.suppressEvents = NO;
        NSLog(@"[LynxRichTextInput] List item moved down");
    });

    callback(kUIMethodSuccess, nil);
}

#pragma mark - Helper Methods

/**
 * Create paragraph style with list metadata
 * This stores list information in custom attributes rather than as text markers
 */
- (NSDictionary *)attributesForListType:(NSString *)listType
                                  index:(NSInteger)index
                                  depth:(NSInteger)depth {
    NSMutableParagraphStyle *paragraphStyle = [[NSMutableParagraphStyle alloc] init];

    // Add indentation based on depth
    if (depth > 0) {
        CGFloat indent = (depth - 1) * 20.0; // 20 points per indent level
        paragraphStyle.firstLineHeadIndent = indent;
        paragraphStyle.headIndent = indent;
    }

    NSMutableDictionary *attrs = [NSMutableDictionary dictionaryWithObject:paragraphStyle
                                                                     forKey:NSParagraphStyleAttributeName];

    // Store list metadata in custom attributes
    if (listType) {
        attrs[LynxListTypeAttributeName] = listType;
        attrs[LynxListIndexAttributeName] = @(index);
        attrs[LynxListDepthAttributeName] = @(depth);
    }

    return attrs;
}

/**
 * Get list marker string for visual display
 * These will be inserted as attributed text marked as non-content
 */
- (NSAttributedString *)markerForListType:(NSString *)listType
                                    index:(NSInteger)index {
    NSString *markerText;

    if ([listType isEqualToString:@"bullet"]) {
        markerText = @"• ";
    } else if ([listType isEqualToString:@"ordered"]) {
        markerText = [NSString stringWithFormat:@"%ld. ", (long)index];
    } else if ([listType isEqualToString:@"task"]) {
        markerText = @"☐ ";
    } else {
        markerText = @"";
    }

    // Mark the marker text with special attribute so we can identify it later
    NSDictionary *markerAttrs = @{
        @"LynxMarkerText": @YES,
        NSForegroundColorAttributeName: [UIColor secondaryLabelColor]
    };

    return [[NSAttributedString alloc] initWithString:markerText attributes:markerAttrs];
}

#pragma mark - JSON to NSAttributedString Conversion

- (NSAttributedString *)documentToAttributedString:(NSDictionary *)json {
    NSMutableAttributedString *result = [[NSMutableAttributedString alloc] init];

    NSDictionary *docNode = json[@"doc"];
    if (!docNode) return result;

    [self appendNode:docNode to:result listDepth:0 listType:nil listIndex:0];

    return result;
}

- (void)appendNode:(NSDictionary *)node
                to:(NSMutableAttributedString *)attributedString
         listDepth:(NSInteger)listDepth
          listType:(NSString *)listType
         listIndex:(NSInteger)listIndex {

    NSString *type = node[@"type"];
    if (!type) return;

    if ([type isEqualToString:@"doc"]) {
        [self appendChildren:node to:attributedString listDepth:listDepth listType:listType listIndex:listIndex];
    }
    else if ([type isEqualToString:@"paragraph"]) {
        [self appendChildren:node to:attributedString listDepth:listDepth listType:listType listIndex:listIndex];
        if (attributedString.length > 0) {
            [attributedString appendAttributedString:[[NSAttributedString alloc] initWithString:@"\n"]];
        }
    }
    else if ([type isEqualToString:@"heading"]) {
        NSInteger level = [node[@"attrs"][@"level"] integerValue] ?: 1;
        CGFloat fontSize = [@[@32, @24, @20, @18, @16, @14][level - 1] floatValue];

        UIFont *font = [UIFont boldSystemFontOfSize:fontSize];
        NSDictionary *attrs = @{NSFontAttributeName: font};

        NSInteger start = attributedString.length;
        [self appendChildren:node to:attributedString listDepth:listDepth listType:listType listIndex:listIndex];
        NSRange range = NSMakeRange(start, attributedString.length - start);
        [attributedString addAttributes:attrs range:range];

        [attributedString appendAttributedString:[[NSAttributedString alloc] initWithString:@"\n"]];
    }
    else if ([type isEqualToString:@"blockquote"]) {
        // Blockquote marker (marked as non-content)
        NSDictionary *markerAttrs = @{
            @"LynxMarkerText": @YES,
            NSForegroundColorAttributeName: [UIColor secondaryLabelColor],
            NSBackgroundColorAttributeName: [UIColor systemGray6Color]
        };
        [attributedString appendAttributedString:[[NSAttributedString alloc] initWithString:@"│ " attributes:markerAttrs]];

        // Blockquote styling for content
        NSDictionary *attrs = @{
            NSBackgroundColorAttributeName: [UIColor systemGray6Color],
            NSFontAttributeName: [UIFont italicSystemFontOfSize:16],
            @"LynxBlockType": @"blockquote" // Custom attribute for identification
        };

        NSInteger start = attributedString.length;
        [self appendChildren:node to:attributedString listDepth:listDepth listType:listType listIndex:listIndex];
        NSRange range = NSMakeRange(start, attributedString.length - start);
        [attributedString addAttributes:attrs range:range];

        [attributedString appendAttributedString:[[NSAttributedString alloc] initWithString:@"\n"]];
    }
    else if ([type isEqualToString:@"bulletList"]) {
        [self appendChildren:node to:attributedString listDepth:listDepth + 1 listType:@"bullet" listIndex:0];
    }
    else if ([type isEqualToString:@"orderedList"]) {
        [self appendChildren:node to:attributedString listDepth:listDepth + 1 listType:@"ordered" listIndex:1];
    }
    else if ([type isEqualToString:@"taskList"]) {
        [self appendChildren:node to:attributedString listDepth:listDepth + 1 listType:@"task" listIndex:0];
    }
    else if ([type isEqualToString:@"listItem"]) {
        // Insert visual marker (marked as non-content with LynxMarkerText attribute)
        NSAttributedString *marker = [self markerForListType:listType index:listIndex];
        [attributedString appendAttributedString:marker];

        // Get list attributes for the content
        NSDictionary *listAttrs = [self attributesForListType:listType index:listIndex depth:listDepth];

        // Append children with list attributes
        NSInteger contentStart = attributedString.length;
        [self appendChildren:node to:attributedString listDepth:listDepth listType:listType listIndex:listIndex + 1];

        // Apply list attributes to the content
        if (attributedString.length > contentStart) {
            NSRange contentRange = NSMakeRange(contentStart, attributedString.length - contentStart);
            [attributedString addAttributes:listAttrs range:contentRange];
        }

        [attributedString appendAttributedString:[[NSAttributedString alloc] initWithString:@"\n"]];
    }
    else if ([type isEqualToString:@"taskItem"]) {
        BOOL checked = [node[@"attrs"][@"checked"] boolValue];
        NSString *indent = [@"" stringByPaddingToLength:(listDepth - 1) * 2 withString:@" " startingAtIndex:0];
        NSString *checkbox = checked ? @"☑ " : @"☐ ";

        [attributedString appendAttributedString:[[NSAttributedString alloc] initWithString:[indent stringByAppendingString:checkbox]]];

        if (checked) {
            NSDictionary *strikeAttrs = @{
                NSStrikethroughStyleAttributeName: @(NSUnderlineStyleSingle),
                NSForegroundColorAttributeName: [UIColor systemGrayColor]
            };

            NSInteger start = attributedString.length;
            [self appendChildren:node to:attributedString listDepth:listDepth listType:listType listIndex:listIndex];
            NSRange range = NSMakeRange(start, attributedString.length - start);
            [attributedString addAttributes:strikeAttrs range:range];
        } else {
            [self appendChildren:node to:attributedString listDepth:listDepth listType:listType listIndex:listIndex];
        }

        [attributedString appendAttributedString:[[NSAttributedString alloc] initWithString:@"\n"]];
    }
    else if ([type isEqualToString:@"text"]) {
        NSString *text = node[@"text"] ?: @"";
        NSArray *marks = node[@"marks"] ?: @[];
        NSDictionary *attrs = [self attributesForMarks:marks];

        [attributedString appendAttributedString:[[NSAttributedString alloc] initWithString:text attributes:attrs]];
    }
}

- (void)appendChildren:(NSDictionary *)node
                    to:(NSMutableAttributedString *)attributedString
             listDepth:(NSInteger)listDepth
              listType:(NSString *)listType
             listIndex:(NSInteger)listIndex {

    NSArray *children = node[@"content"];
    if (!children) return;

    for (NSDictionary *child in children) {
        [self appendNode:child to:attributedString listDepth:listDepth listType:listType listIndex:listIndex];
    }
}

- (NSDictionary *)attributesForMarks:(NSArray *)marks {
    NSMutableDictionary *attrs = [NSMutableDictionary dictionaryWithObject:[UIFont systemFontOfSize:16] forKey:NSFontAttributeName];

    UIFontDescriptorSymbolicTraits traits = 0;

    for (NSDictionary *mark in marks) {
        NSString *markType = mark[@"type"];

        if ([markType isEqualToString:@"bold"]) {
            traits |= UIFontDescriptorTraitBold;
        }
        else if ([markType isEqualToString:@"italic"]) {
            traits |= UIFontDescriptorTraitItalic;
        }
        else if ([markType isEqualToString:@"strike"]) {
            attrs[NSStrikethroughStyleAttributeName] = @(NSUnderlineStyleSingle);
        }
        else if ([markType isEqualToString:@"link"]) {
            NSString *href = mark[@"attrs"][@"href"];
            if (href) {
                attrs[NSLinkAttributeName] = href;
                attrs[NSForegroundColorAttributeName] = [UIColor systemBlueColor];
                attrs[NSUnderlineStyleAttributeName] = @(NSUnderlineStyleSingle);
            }
        }
    }

    if (traits != 0) {
        UIFont *baseFont = attrs[NSFontAttributeName];
        UIFontDescriptor *descriptor = [[baseFont fontDescriptor] fontDescriptorWithSymbolicTraits:traits];
        if (descriptor) {
            attrs[NSFontAttributeName] = [UIFont fontWithDescriptor:descriptor size:16];
        }
    }

    return attrs;
}

#pragma mark - NSAttributedString to JSON Conversion

/**
 * Extract text content, skipping marker text
 * This filters out text marked with LynxMarkerText attribute
 */
- (NSString *)contentTextFromAttributedString:(NSAttributedString *)attrString inRange:(NSRange)range {
    NSMutableString *content = [NSMutableString string];

    if (range.length == 0 || range.location >= attrString.length) {
        return @"";
    }

    // Ensure range is within bounds
    if (NSMaxRange(range) > attrString.length) {
        range.length = attrString.length - range.location;
    }

    [attrString enumerateAttributesInRange:range
                                   options:0
                                usingBlock:^(NSDictionary *attrs, NSRange attrRange, BOOL *stop) {
        // Skip text marked as marker (non-content)
        if (attrs[@"LynxMarkerText"]) {
            return; // Skip this range
        }

        NSString *text = [attrString.string substringWithRange:attrRange];
        [content appendString:text];
    }];

    return content;
}

- (NSDictionary *)attributedStringToJSON:(NSAttributedString *)attrString {
    NSMutableArray *blocks = [NSMutableArray array];
    NSString *fullText = attrString.string;

    // Remove trailing newline if present to avoid creating extra empty paragraph
    if ([fullText hasSuffix:@"\n"]) {
        fullText = [fullText substringToIndex:fullText.length - 1];
    }

    // Split by newlines to get lines
    NSArray *lines = [fullText componentsSeparatedByString:@"\n"];
    NSUInteger currentPos = 0;

    NSMutableArray *currentListItems = nil;
    NSString *currentListType = nil;

    for (NSString *line in lines) {
        NSRange lineRange = NSMakeRange(currentPos, line.length);

        // First, check if this line is a heading by analyzing font attributes
        NSInteger headingLevel = 0;
        if (lineRange.length > 0 && lineRange.location < attrString.length) {
            NSUInteger checkPos = MIN(lineRange.location, attrString.length - 1);
            NSDictionary *attrs = [attrString attributesAtIndex:checkPos effectiveRange:NULL];
            UIFont *font = attrs[NSFontAttributeName];

            if (font) {
                BOOL isBold = (font.fontDescriptor.symbolicTraits & UIFontDescriptorTraitBold) != 0;
                CGFloat fontSize = font.pointSize;

                // Detect heading level by font size + bold
                if (isBold) {
                    if (fabs(fontSize - 32.0) < 1.0) headingLevel = 1;
                    else if (fabs(fontSize - 24.0) < 1.0) headingLevel = 2;
                    else if (fabs(fontSize - 20.0) < 1.0) headingLevel = 3;
                    else if (fabs(fontSize - 18.0) < 1.0) headingLevel = 4;
                    // Level 5 (16pt) conflicts with bold text, so we skip it
                    else if (fabs(fontSize - 14.0) < 1.0) headingLevel = 6;
                }
            }
        }

        // Read list type from custom attributes instead of parsing text
        NSString *listType = nil;
        NSString *blockType = nil;

        if (headingLevel == 0 && lineRange.length > 0 && lineRange.location < attrString.length) {
            // Check at the start of the line (after any marker)
            NSUInteger checkPos = lineRange.location;

            // Skip past marker text to find the actual content
            __block NSUInteger contentStart = checkPos;
            if (checkPos < attrString.length) {
                [attrString enumerateAttributesInRange:NSMakeRange(checkPos, MIN(10, attrString.length - checkPos))
                                               options:0
                                            usingBlock:^(NSDictionary *attrs, NSRange range, BOOL *stop) {
                    if (!attrs[@"LynxMarkerText"]) {
                        contentStart = range.location;
                        *stop = YES;
                    }
                }];
            }

            // Read list metadata from attributes at content position
            if (contentStart < attrString.length) {
                NSDictionary *attrs = [attrString attributesAtIndex:contentStart effectiveRange:NULL];

                // Check for list attributes
                NSString *attrListType = attrs[LynxListTypeAttributeName];
                if (attrListType) {
                    if ([attrListType isEqualToString:@"bullet"]) {
                        listType = @"bullet";
                    } else if ([attrListType isEqualToString:@"ordered"]) {
                        listType = @"ordered";
                    } else if ([attrListType isEqualToString:@"task"]) {
                        listType = @"task";
                    }
                }

                // Check for blockquote
                blockType = attrs[@"LynxBlockType"];
                if ([blockType isEqualToString:@"blockquote"]) {
                    listType = @"blockquote";
                }
            }
        }

        // Build line content (skipping marker text)
        NSMutableArray *content = [NSMutableArray array];

        if (lineRange.length > 0 && lineRange.location < attrString.length) {
            // Ensure range is within bounds
            if (NSMaxRange(lineRange) > attrString.length) {
                lineRange.length = attrString.length - lineRange.location;
            }

            [attrString enumerateAttributesInRange:lineRange
                                           options:0
                                        usingBlock:^(NSDictionary *attrs, NSRange range, BOOL *stop) {
                // Skip marker text - it's not part of the document content
                if (attrs[@"LynxMarkerText"]) {
                    return;
                }

                NSString *text = [fullText substringWithRange:range];

                // Extract marks
                NSMutableArray *marks = [NSMutableArray array];
                UIFont *font = attrs[NSFontAttributeName];
                if (font) {
                    UIFontDescriptorSymbolicTraits traits = font.fontDescriptor.symbolicTraits;
                    // Don't add bold mark if this is a heading (headings are inherently bold)
                    if ((traits & UIFontDescriptorTraitBold) && headingLevel == 0) {
                        [marks addObject:@{@"type": @"bold"}];
                    }
                    if (traits & UIFontDescriptorTraitItalic) {
                        // Don't add italic for blockquotes (inherently italic)
                        if (![listType isEqualToString:@"blockquote"]) {
                            [marks addObject:@{@"type": @"italic"}];
                        }
                    }
                }
                if (attrs[NSStrikethroughStyleAttributeName]) {
                    [marks addObject:@{@"type": @"strike"}];
                }
                if (attrs[NSLinkAttributeName]) {
                    [marks addObject:@{@"type": @"link", @"attrs": @{@"href": attrs[NSLinkAttributeName]}}];
                }

                NSMutableDictionary *textNode = [NSMutableDictionary dictionaryWithDictionary:@{
                    @"type": @"text",
                    @"text": text
                }];
                if (marks.count > 0) {
                    textNode[@"marks"] = marks;
                }
                [content addObject:textNode];
            }];
        }

        // If no content was added, add empty text node
        if (content.count == 0) {
            [content addObject:@{@"type": @"text", @"text": @""}];
        }

        // Handle list grouping
        if ([listType isEqualToString:@"bullet"] || [listType isEqualToString:@"ordered"]) {
            // If starting new list or continuing same type
            if (!currentListItems || ![currentListType isEqualToString:listType]) {
                // Close previous list if any
                if (currentListItems) {
                    NSString *listNodeType = [currentListType isEqualToString:@"bullet"] ? @"bulletList" : @"orderedList";
                    NSMutableDictionary *listNode = [NSMutableDictionary dictionaryWithDictionary:@{
                        @"type": listNodeType,
                        @"content": currentListItems
                    }];
                    if ([listNodeType isEqualToString:@"orderedList"]) {
                        listNode[@"attrs"] = @{@"start": @1};
                    }
                    [blocks addObject:listNode];
                }
                // Start new list
                currentListItems = [NSMutableArray array];
                currentListType = listType;
            }

            // Add list item
            [currentListItems addObject:@{
                @"type": @"listItem",
                @"content": @[@{
                    @"type": @"paragraph",
                    @"content": content
                }]
            }];
        } else {
            // Close list if open
            if (currentListItems) {
                NSString *listNodeType = [currentListType isEqualToString:@"bullet"] ? @"bulletList" : @"orderedList";
                NSMutableDictionary *listNode = [NSMutableDictionary dictionaryWithDictionary:@{
                    @"type": listNodeType,
                    @"content": currentListItems
                }];
                if ([listNodeType isEqualToString:@"orderedList"]) {
                    listNode[@"attrs"] = @{@"start": @1};
                }
                [blocks addObject:listNode];
                currentListItems = nil;
                currentListType = nil;
            }

            // Add as heading, paragraph, or blockquote
            if (headingLevel > 0) {
                [blocks addObject:@{
                    @"type": @"heading",
                    @"attrs": @{@"level": @(headingLevel)},
                    @"content": content
                }];
            } else if ([listType isEqualToString:@"blockquote"]) {
                [blocks addObject:@{
                    @"type": @"blockquote",
                    @"content": content
                }];
            } else {
                [blocks addObject:@{
                    @"type": @"paragraph",
                    @"content": content
                }];
            }
        }

        currentPos += line.length + 1;
    }

    // Close final list if any
    if (currentListItems) {
        NSString *listNodeType = [currentListType isEqualToString:@"bullet"] ? @"bulletList" : @"orderedList";
        NSMutableDictionary *listNode = [NSMutableDictionary dictionaryWithDictionary:@{
            @"type": listNodeType,
            @"content": currentListItems
        }];
        if ([listNodeType isEqualToString:@"orderedList"]) {
            listNode[@"attrs"] = @{@"start": @1};
        }
        [blocks addObject:listNode];
    }

    return @{
        @"doc": @{
            @"type": @"doc",
            @"content": blocks
        }
    };
}

#pragma mark - UITextViewDelegate

- (void)textViewDidChange:(UITextView *)textView {
    if (self.suppressEvents) {
        NSLog(@"[LynxRichTextInput] textViewDidChange - SUPPRESSED");
        return;
    }
    NSRange sel = textView.selectedRange;
    NSLog(@"[LynxRichTextInput] textViewDidChange - text length: %lu, selection: %lu-%lu",
          (unsigned long)textView.text.length, (unsigned long)sel.location, (unsigned long)(sel.location + sel.length));

    // Convert attributed string to JSON
    NSDictionary *docJSON = [self attributedStringToJSON:textView.attributedText];

    [self emitEvent:@"input" detail:@{
        @"documentJSON": docJSON,
        @"selection": @{
            @"start": @(sel.location),
            @"end": @(sel.location + sel.length)
        }
    }];
}

- (void)textViewDidChangeSelection:(UITextView *)textView {
    if (self.suppressEvents) return;
    NSRange sel = textView.selectedRange;
    if (!NSEqualRanges(self.previousSelection, sel)) {
        self.previousSelection = sel;
        [self emitEvent:@"selection" detail:@{
            @"start": @(sel.location),
            @"end": @(sel.location + sel.length)
        }];
    }
}

- (BOOL)textView:(UITextView *)textView shouldChangeTextInRange:(NSRange)range replacementText:(NSString *)text {
    if ([text isEqualToString:@"\n"]) {
        [self emitEvent:@"keypress" detail:@{@"key": @"Enter"}];

        // Handle list continuation on Enter
        return [self handleListContinuationAtRange:range inTextView:textView];
    } else if ([text isEqualToString:@""]) {
        [self emitEvent:@"keypress" detail:@{@"key": @"Backspace"}];
    }
    return YES;
}

- (BOOL)handleListContinuationAtRange:(NSRange)range inTextView:(UITextView *)textView {
    NSString *fullText = textView.text;

    // Find the paragraph range containing the cursor
    NSRange paragraphRange = [fullText paragraphRangeForRange:range];
    NSString *currentLine = [fullText substringWithRange:paragraphRange];

    NSLog(@"[LynxRichTextInput] handleListContinuation - current line: '%@'", currentLine);

    // Use helper to calculate list continuation
    LynxListContinuationResult *result = [LynxTextListHelper calculateListContinuation:currentLine];

    // If not in a list, allow default behavior
    if (!result.shouldContinue && !result.shouldExit) {
        NSLog(@"[LynxRichTextInput] Not in a list, allowing default Enter behavior");
        return YES;
    }

    NSLog(@"[LynxRichTextInput] List continuation - shouldExit: %d, shouldContinue: %d",
          result.shouldExit, result.shouldContinue);

    NSMutableAttributedString *attrString = [[NSMutableAttributedString alloc] initWithAttributedString:textView.attributedText];

    // Get attributes at cursor position for consistency (with bounds checking)
    NSDictionary *attrs = nil;
    if (range.location < attrString.length) {
        attrs = [attrString attributesAtIndex:range.location effectiveRange:NULL];
    } else if (attrString.length > 0) {
        attrs = [attrString attributesAtIndex:attrString.length - 1 effectiveRange:NULL];
    } else {
        attrs = @{NSFontAttributeName: [UIFont systemFontOfSize:16]};
    }

    // Apply list continuation using helper
    NSRange newSelection = [LynxTextListHelper applyListContinuation:attrString
                                                             atRange:range
                                                      paragraphRange:paragraphRange
                                                              result:result
                                                          attributes:attrs];

    // Update text view
    self.suppressEvents = YES;
    textView.attributedText = attrString;
    textView.selectedRange = newSelection;

    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.1 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        self.suppressEvents = NO;
    });

    // Prevent default newline insertion
    return NO;
}

- (void)emitEvent:(NSString *)name detail:(NSDictionary *)detail {
    if (self.suppressEvents) return;

    NSLog(@"[LynxRichTextInput] Emitting event: %@ with detail: %@", name, detail);
    LynxCustomEvent *event = [[LynxDetailEvent alloc] initWithName:name targetSign:[self sign] detail:detail];
    [self.context.eventEmitter dispatchCustomEvent:event];
    NSLog(@"[LynxRichTextInput] Event dispatched successfully");
}

@end
