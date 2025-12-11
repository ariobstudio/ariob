// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

#import "LynxTextInput.h"
#import <Lynx/LynxComponentRegistry.h>
#import <Lynx/LynxPropsProcessor.h>
#import <Lynx/LynxUIMethodProcessor.h>
#import <Lynx/LynxUIOwner.h>

@interface LynxTextInput ()
@property(nonatomic, strong) UITextView *textView;
@property(nonatomic, assign) NSRange previousSelection;
@property(nonatomic, assign) BOOL suppressEvents;
@end

@implementation LynxTextInput

- (UITextView *)createView {
    UITextView *textView = [[UITextView alloc] init];
    textView.delegate = self;
    textView.editable = YES;
    textView.scrollEnabled = YES;
    textView.font = [UIFont systemFontOfSize:16];
    textView.textColor = [UIColor labelColor];
    textView.backgroundColor = [UIColor clearColor];
    textView.textContainerInset = UIEdgeInsetsMake(0, 0, 0, 0);
    textView.textContainer.lineFragmentPadding = 0;

    self.previousSelection = NSMakeRange(0, 0);
    self.suppressEvents = NO;
    self.textView = textView;
    return textView;
}

LYNX_PROP_SETTER("text", setText, NSString *) {
    if (value) {
        self.suppressEvents = YES;
        self.textView.text = value;
        dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.05 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
            self.suppressEvents = NO;
        });
    }
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

- (void)textViewDidChange:(UITextView *)textView {
    if (self.suppressEvents) return;
    NSRange sel = textView.selectedRange;
    [self emitEvent:@"input" detail:@{@"text": textView.text ?: @"", @"selection": @{@"start": @(sel.location), @"end": @(sel.location + sel.length)}}];
}

- (void)textViewDidChangeSelection:(UITextView *)textView {
    if (self.suppressEvents) return;
    NSRange sel = textView.selectedRange;
    if (!NSEqualRanges(self.previousSelection, sel)) {
        self.previousSelection = sel;
        [self emitEvent:@"selection" detail:@{@"start": @(sel.location), @"end": @(sel.location + sel.length)}];
    }
}

- (BOOL)textView:(UITextView *)textView shouldChangeTextInRange:(NSRange)range replacementText:(NSString *)text {
    if ([text isEqualToString:@"\n"]) [self emitEvent:@"keypress" detail:@{@"key": @"Enter"}];
    else if ([text isEqualToString:@""]) [self emitEvent:@"keypress" detail:@{@"key": @"Backspace"}];
    return YES;
}

- (void)emitEvent:(NSString *)name detail:(NSDictionary *)detail {
    if (self.suppressEvents) return;
    LynxCustomEvent *event = [[LynxDetailEvent alloc] initWithName:name targetSign:[self sign] detail:detail];
    [self.context.eventEmitter dispatchCustomEvent:event];
}

@end
