//
//  LynxBlockComponents.m
//  Ariob
//
//  Implementation of all block components for the rich text editor.
//  Uses Objective-C for compatibility with LynxJS framework.
//

#import "LynxBlockComponents.h"
#import <Lynx/LynxComponentRegistry.h>
#import <Lynx/LynxPropsProcessor.h>
#import <Lynx/LynxUIMethodProcessor.h>
#import <Lynx/LynxUIOwner.h>

// LynxCustomEvent and LynxDetailEvent are forward-declared in LynxUIOwner.h
@class LynxCustomEvent;
@class LynxDetailEvent;

// MARK: - Heading Block

@interface LynxHeadingBlock ()
@property (nonatomic, assign) NSInteger level;
@end

@implementation LynxHeadingBlock

- (UITextField *)createView {
    NSLog(@"[LynxHeadingBlock] createView");
    UITextField *textField = [[UITextField alloc] init];
    textField.delegate = self;
    textField.font = [UIFont systemFontOfSize:32];  // Default H1, NOT bold!
    textField.textColor = [UIColor labelColor];
    textField.returnKeyType = UIReturnKeyDefault;
    textField.translatesAutoresizingMaskIntoConstraints = NO;
    textField.placeholder = @"Heading";
    textField.clearButtonMode = UITextFieldViewModeNever;

    // Add height constraint so the text field is visible
    [textField.heightAnchor constraintGreaterThanOrEqualToConstant:44].active = YES;

    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(textFieldDidChange:)
                                                 name:UITextFieldTextDidChangeNotification
                                               object:textField];

    self.level = 1;
    return textField;
}

LYNX_PROP_SETTER("level", setLevel, NSInteger) {
    self.level = value;
    CGFloat sizes[] = {32, 24, 20, 18, 16, 14};
    NSInteger index = MIN(MAX(value - 1, 0), 5);
    self.view.font = [UIFont systemFontOfSize:sizes[index]];  // NOT boldSystemFont!
    NSLog(@"[LynxHeadingBlock] setLevel: %ld, fontSize: %.1f", (long)value, sizes[index]);
}

LYNX_PROP_SETTER("value", setValue, NSString *) {
    self.view.text = value;
}

- (void)textFieldDidChange:(NSNotification *)notification {
    [self emitEvent:@"input" detail:@{@"value": self.view.text ?: @""}];
}

- (BOOL)textFieldShouldReturn:(UITextField *)textField {
    [self emitEvent:@"enter" detail:@{}];
    return NO;
}

LYNX_UI_METHOD(focus) {
    if ([self.view becomeFirstResponder]) {
        callback(kUIMethodSuccess, nil);
    } else {
        callback(kUIMethodUnknown, @"fail to focus");
    }
}

- (void)emitEvent:(NSString *)name detail:(NSDictionary *)detail {
    LynxCustomEvent *eventInfo = [[LynxDetailEvent alloc] initWithName:name
                                                            targetSign:[self sign]
                                                                detail:detail];
    [self.context.eventEmitter dispatchCustomEvent:eventInfo];
}

- (void)dealloc {
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

@end

// MARK: - Paragraph Block

@implementation LynxParagraphBlock

- (UITextField *)createView {
    NSLog(@"[LynxParagraphBlock] createView");
    UITextField *textField = [[UITextField alloc] init];
    textField.delegate = self;
    textField.font = [UIFont systemFontOfSize:16];
    textField.textColor = [UIColor labelColor];
    textField.returnKeyType = UIReturnKeyDefault;
    textField.translatesAutoresizingMaskIntoConstraints = NO;
    textField.placeholder = @"Type something...";
    textField.clearButtonMode = UITextFieldViewModeNever;

    // Add height constraint so the text field is visible
    [textField.heightAnchor constraintGreaterThanOrEqualToConstant:44].active = YES;

    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(textFieldDidChange:)
                                                 name:UITextFieldTextDidChangeNotification
                                               object:textField];
    return textField;
}

LYNX_PROP_SETTER("value", setValue, NSString *) {
    self.view.text = value;
}

- (void)textFieldDidChange:(NSNotification *)notification {
    [self emitEvent:@"input" detail:@{@"value": self.view.text ?: @""}];
}

- (BOOL)textFieldShouldReturn:(UITextField *)textField {
    [self emitEvent:@"enter" detail:@{}];
    return NO;
}

LYNX_UI_METHOD(focus) {
    if ([self.view becomeFirstResponder]) {
        callback(kUIMethodSuccess, nil);
    } else {
        callback(kUIMethodUnknown, @"fail to focus");
    }
}

- (void)emitEvent:(NSString *)name detail:(NSDictionary *)detail {
    LynxCustomEvent *eventInfo = [[LynxDetailEvent alloc] initWithName:name
                                                            targetSign:[self sign]
                                                                detail:detail];
    [self.context.eventEmitter dispatchCustomEvent:eventInfo];
}

- (void)dealloc {
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

@end

// MARK: - Blockquote Block

@interface LynxBlockquoteBlock ()
@property (nonatomic, strong) UIView *borderView;
@property (nonatomic, strong) UITextField *textField;
@end

@implementation LynxBlockquoteBlock

- (UIView *)createView {
    NSLog(@"[LynxBlockquoteBlock] createView");

    // Container view with light gray background
    UIView *containerView = [[UIView alloc] init];
    containerView.backgroundColor = [[UIColor systemGray6Color] colorWithAlphaComponent:0.3];

    // Left border (4pt wide, gray)
    self.borderView = [[UIView alloc] init];
    self.borderView.backgroundColor = [UIColor systemGray3Color];
    self.borderView.translatesAutoresizingMaskIntoConstraints = NO;
    [containerView addSubview:self.borderView];

    // Text field with italic font
    self.textField = [[UITextField alloc] init];
    self.textField.delegate = self;
    self.textField.font = [UIFont italicSystemFontOfSize:16];
    self.textField.textColor = [UIColor labelColor];
    self.textField.returnKeyType = UIReturnKeyDefault;
    self.textField.translatesAutoresizingMaskIntoConstraints = NO;
    self.textField.placeholder = @"Quote...";
    self.textField.clearButtonMode = UITextFieldViewModeNever;
    [containerView addSubview:self.textField];

    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(textFieldDidChange:)
                                                 name:UITextFieldTextDidChangeNotification
                                               object:self.textField];

    // Layout constraints
    [NSLayoutConstraint activateConstraints:@[
        // Border: left edge, 4pt wide, full height
        [self.borderView.leadingAnchor constraintEqualToAnchor:containerView.leadingAnchor],
        [self.borderView.topAnchor constraintEqualToAnchor:containerView.topAnchor],
        [self.borderView.bottomAnchor constraintEqualToAnchor:containerView.bottomAnchor],
        [self.borderView.widthAnchor constraintEqualToConstant:4],

        // Text field: 16pt from border, 8pt padding top/bottom/right
        [self.textField.leadingAnchor constraintEqualToAnchor:self.borderView.trailingAnchor constant:16],
        [self.textField.trailingAnchor constraintEqualToAnchor:containerView.trailingAnchor constant:-8],
        [self.textField.topAnchor constraintEqualToAnchor:containerView.topAnchor constant:8],
        [self.textField.bottomAnchor constraintEqualToAnchor:containerView.bottomAnchor constant:-8],
    ]];

    return containerView;
}

LYNX_PROP_SETTER("value", setValue, NSString *) {
    self.textField.text = value;
}

- (void)textFieldDidChange:(NSNotification *)notification {
    [self emitEvent:@"input" detail:@{@"value": self.textField.text ?: @""}];
}

- (BOOL)textFieldShouldReturn:(UITextField *)textField {
    [self emitEvent:@"enter" detail:@{}];
    return NO;
}

LYNX_UI_METHOD(focus) {
    if ([self.textField becomeFirstResponder]) {
        callback(kUIMethodSuccess, nil);
    } else {
        callback(kUIMethodUnknown, @"fail to focus");
    }
}

- (void)emitEvent:(NSString *)name detail:(NSDictionary *)detail {
    LynxCustomEvent *eventInfo = [[LynxDetailEvent alloc] initWithName:name
                                                            targetSign:[self sign]
                                                                detail:detail];
    [self.context.eventEmitter dispatchCustomEvent:eventInfo];
}

- (void)dealloc {
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

@end

// MARK: - List Block

@interface LynxListBlock ()
@property (nonatomic, strong) NSString *listType;
@property (nonatomic, assign) NSInteger startNumber;
@property (nonatomic, strong) NSMutableArray<LynxListItem *> *childItems;
@end

@implementation LynxListBlock

- (UIStackView *)createView {
    NSLog(@"[LynxListBlock] createView");

    UIStackView *stackView = [[UIStackView alloc] init];
    stackView.axis = UILayoutConstraintAxisVertical;
    stackView.alignment = UIStackViewAlignmentFill;
    stackView.distribution = UIStackViewDistributionFill;
    stackView.spacing = 4;

    self.listType = @"bullet";
    self.startNumber = 1;
    self.childItems = [NSMutableArray array];

    return stackView;
}

LYNX_PROP_SETTER("type", setType, NSString *) {
    NSLog(@"[LynxListBlock] setType: %@", value);
    self.listType = value;
    [self updateAllChildMarkers];
}

LYNX_PROP_SETTER("start", setStart, NSInteger) {
    NSLog(@"[LynxListBlock] setStart: %ld", (long)value);
    self.startNumber = value;
    [self updateAllChildMarkers];
}

- (void)registerChild:(LynxListItem *)item {
    NSLog(@"[LynxListBlock] Registering child");
    [self.childItems addObject:item];
    NSInteger index = self.childItems.count - 1;
    [item updateMarkerWithType:self.listType index:index startNumber:self.startNumber];
}

- (void)unregisterChild:(LynxListItem *)item {
    NSLog(@"[LynxListBlock] Unregistering child");
    [self.childItems removeObject:item];
    [self updateAllChildMarkers];
}

- (NSInteger)indexOfChild:(LynxListItem *)item {
    return [self.childItems indexOfObject:item];
}

- (void)updateAllChildMarkers {
    NSLog(@"[LynxListBlock] Updating all child markers, count: %lu", (unsigned long)self.childItems.count);
    for (NSInteger i = 0; i < self.childItems.count; i++) {
        [self.childItems[i] updateMarkerWithType:self.listType index:i startNumber:self.startNumber];
    }
}

@end

// MARK: - List Item

@interface LynxListItem ()
@property (nonatomic, strong) UIStackView *containerStack;
@property (nonatomic, strong) UIView *markerView;
@property (nonatomic, strong) UITextField *textField;
@property (nonatomic, assign) BOOL isChecked;
@property (nonatomic, strong) NSString *currentType;
@property (nonatomic, weak) LynxListBlock *parentList;
@end

@implementation LynxListItem

- (UIView *)createView {
    NSLog(@"[LynxListItem] createView");

    // Horizontal container
    self.containerStack = [[UIStackView alloc] init];
    self.containerStack.axis = UILayoutConstraintAxisHorizontal;
    self.containerStack.alignment = UIStackViewAlignmentTop;
    self.containerStack.distribution = UIStackViewDistributionFill;
    self.containerStack.spacing = 8;

    // Initial bullet marker
    self.markerView = [self createBulletMarker];

    // Text field
    self.textField = [[UITextField alloc] init];
    self.textField.delegate = self;
    self.textField.font = [UIFont systemFontOfSize:16];
    self.textField.textColor = [UIColor labelColor];
    self.textField.returnKeyType = UIReturnKeyDefault;
    self.textField.translatesAutoresizingMaskIntoConstraints = NO;
    self.textField.placeholder = @"List item";
    self.textField.clearButtonMode = UITextFieldViewModeNever;

    // Add height constraint so the text field is visible
    [self.textField.heightAnchor constraintGreaterThanOrEqualToConstant:32].active = YES;

    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(textFieldDidChange:)
                                                 name:UITextFieldTextDidChangeNotification
                                               object:self.textField];

    [self.containerStack addArrangedSubview:self.markerView];
    [self.containerStack addArrangedSubview:self.textField];

    self.isChecked = NO;
    self.currentType = @"bullet";

    return self.containerStack;
}

LYNX_PROP_SETTER("value", setValue, NSString *) {
    self.textField.text = value;
}

LYNX_PROP_SETTER("checked", setChecked, BOOL) {
    self.isChecked = value;
    if ([self.markerView isKindOfClass:[UIButton class]]) {
        [(UIButton *)self.markerView setSelected:value];
    }
    [self updateTextStyle];
}

- (void)updateMarkerWithType:(NSString *)type index:(NSInteger)index startNumber:(NSInteger)startNumber {
    NSLog(@"[LynxListItem] updateMarker: type=%@, index=%ld", type, (long)index);

    self.currentType = type;

    // Remove old marker
    [self.markerView removeFromSuperview];

    // Create new marker
    if ([type isEqualToString:@"bullet"]) {
        self.markerView = [self createBulletMarker];
    } else if ([type isEqualToString:@"ordered"]) {
        self.markerView = [self createOrderedMarker:startNumber + index];
    } else if ([type isEqualToString:@"task"]) {
        self.markerView = [self createTaskMarker];
    } else {
        self.markerView = [self createBulletMarker];
    }

    // Insert at beginning
    [self.containerStack insertArrangedSubview:self.markerView atIndex:0];

    // Update text style for tasks
    if ([type isEqualToString:@"task"]) {
        [self updateTextStyle];
    }
}

- (UIView *)createBulletMarker {
    UILabel *label = [[UILabel alloc] init];
    label.text = @"•";
    label.font = [UIFont systemFontOfSize:16];
    label.textColor = [UIColor labelColor];
    [label setContentHuggingPriority:UILayoutPriorityRequired forAxis:UILayoutConstraintAxisHorizontal];
    [label setContentCompressionResistancePriority:UILayoutPriorityRequired forAxis:UILayoutConstraintAxisHorizontal];
    return label;
}

- (UIView *)createOrderedMarker:(NSInteger)number {
    UILabel *label = [[UILabel alloc] init];
    label.text = [NSString stringWithFormat:@"%ld.", (long)number];
    label.font = [UIFont systemFontOfSize:16];
    label.textColor = [UIColor labelColor];
    [label setContentHuggingPriority:UILayoutPriorityRequired forAxis:UILayoutConstraintAxisHorizontal];
    [label setContentCompressionResistancePriority:UILayoutPriorityRequired forAxis:UILayoutConstraintAxisHorizontal];
    return label;
}

- (UIView *)createTaskMarker {
    UIButton *button = [UIButton buttonWithType:UIButtonTypeCustom];
    [button setTitle:@"☐" forState:UIControlStateNormal];
    [button setTitle:@"☑" forState:UIControlStateSelected];
    [button setTitleColor:[UIColor labelColor] forState:UIControlStateNormal];
    [button setTitleColor:[UIColor systemBlueColor] forState:UIControlStateSelected];
    button.titleLabel.font = [UIFont systemFontOfSize:18];
    button.selected = self.isChecked;
    [button addTarget:self action:@selector(toggleCheckbox:) forControlEvents:UIControlEventTouchUpInside];
    [button setContentHuggingPriority:UILayoutPriorityRequired forAxis:UILayoutConstraintAxisHorizontal];
    [button setContentCompressionResistancePriority:UILayoutPriorityRequired forAxis:UILayoutConstraintAxisHorizontal];
    return button;
}

- (void)toggleCheckbox:(UIButton *)button {
    self.isChecked = !self.isChecked;
    button.selected = self.isChecked;
    [self updateTextStyle];
    [self emitEvent:@"toggle" detail:@{@"checked": @(self.isChecked)}];
}

- (void)updateTextStyle {
    if (![self.currentType isEqualToString:@"task"]) return;

    if (self.isChecked) {
        NSDictionary *attributes = @{
            NSStrikethroughStyleAttributeName: @(NSUnderlineStyleSingle),
            NSForegroundColorAttributeName: [UIColor systemGrayColor]
        };
        self.textField.attributedText = [[NSAttributedString alloc] initWithString:self.textField.text ?: @""
                                                                        attributes:attributes];
    } else {
        self.textField.attributedText = nil;
        self.textField.textColor = [UIColor labelColor];
    }
}

- (void)textFieldDidChange:(NSNotification *)notification {
    [self emitEvent:@"input" detail:@{@"value": self.textField.text ?: @""}];
}

- (BOOL)textFieldShouldReturn:(UITextField *)textField {
    NSString *text = [textField.text stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceCharacterSet]];
    BOOL hasContent = text.length > 0;

    if (hasContent) {
        [self emitEvent:@"addItem" detail:@{}];
    } else {
        [self emitEvent:@"exitList" detail:@{}];
    }

    return NO;
}

LYNX_UI_METHOD(focus) {
    if ([self.textField becomeFirstResponder]) {
        callback(kUIMethodSuccess, nil);
    } else {
        callback(kUIMethodUnknown, @"fail to focus");
    }
}

- (void)emitEvent:(NSString *)name detail:(NSDictionary *)detail {
    LynxCustomEvent *eventInfo = [[LynxDetailEvent alloc] initWithName:name
                                                            targetSign:[self sign]
                                                                detail:detail];
    [self.context.eventEmitter dispatchCustomEvent:eventInfo];
}

- (void)dealloc {
    [[NSNotificationCenter defaultCenter] removeObserver:self];
    [self.parentList unregisterChild:self];
}

@end

// MARK: - Registration

@implementation LynxBlockComponentsRegistry

+ (void)registerComponents {
    // This method is intentionally empty.
    // Components are registered manually in LynxViewShellViewController.m
    // using [builder.config registerUI:ClassName.class withName:@"tag-name"]
    NSLog(@"[LynxBlockComponentsRegistry] Note: Components should be registered in LynxViewShellViewController");
}

@end
