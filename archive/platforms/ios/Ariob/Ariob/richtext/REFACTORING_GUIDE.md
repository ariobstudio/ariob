# iOS Rich Text Editor Refactoring Guide

## Overview

The native iOS rich text editor has been refactored to use helper classes and protocols for better modularity, testability, and maintainability. This document explains the architecture improvements and how to work with the new structure.

## Architecture Improvements

### Before Refactoring

The original `LynxRichTextInput.m` had:
- **Tightly coupled code**: List manipulation logic embedded directly in UI methods
- **Difficult to test**: No separation of concerns between UI and business logic
- **Code duplication**: Similar patterns repeated across methods
- **Hard to maintain**: Large methods with inline string manipulation

### After Refactoring

The new architecture separates concerns into:
1. **Helper Classes**: Reusable, testable utilities for list operations
2. **Clear Separation**: UI code in `LynxRichTextInput.m`, business logic in helpers
3. **Type Safety**: Enumerations and result objects for better compile-time checks
4. **Testability**: Pure functions that can be unit tested independently

## New Components

### 1. LynxTextListMarker (Header/Implementation)

**Purpose**: List marker generation and parsing

**Key Features**:
- Detect list markers in text (bullet, ordered, task, blockquote)
- Generate markers for different list types
- Parse marker information (type, length, content)
- Handle indent levels

**Key Types**:
```objc
typedef NS_ENUM(NSInteger, LynxListType) {
    LynxListTypeNone,
    LynxListTypeBullet,      // "• "
    LynxListTypeOrdered,     // "1. ", "2. ", etc.
    LynxListTypeTask,        // "☐ " or "☑ "
    LynxListTypeBlockquote   // "│ "
};

@interface LynxListMarkerInfo : NSObject
@property (nonatomic, assign) LynxListType listType;
@property (nonatomic, copy) NSString *marker;
@property (nonatomic, assign) NSInteger markerLength;
@property (nonatomic, copy) NSString *contentAfterMarker;
@property (nonatomic, assign) NSInteger currentNumber;
@property (nonatomic, assign) BOOL hasMarker;
@end
```

**Key Methods**:
```objc
// Detect marker in a line of text
+ (LynxListMarkerInfo *)detectMarkerInLine:(NSString *)line;

// Generate marker for a list type
+ (NSString *)markerForListType:(LynxListType)listType
                         number:(NSInteger)number;

// Check specific marker types
+ (BOOL)isBulletMarker:(NSString *)text;
+ (BOOL)isOrderedMarker:(NSString *)text number:(NSInteger *)outNumber;
+ (BOOL)isTaskMarker:(NSString *)text checked:(BOOL *)outChecked;
+ (BOOL)isBlockquoteMarker:(NSString *)text;
```

**Example Usage**:
```objc
NSString *line = @"• This is a bullet point";
LynxListMarkerInfo *info = [LynxTextListMarker detectMarkerInLine:line];

if (info.hasMarker && info.listType == LynxListTypeBullet) {
    NSLog(@"Marker: %@", info.marker);                    // "• "
    NSLog(@"Content: %@", info.contentAfterMarker);       // "This is a bullet point"
}
```

### 2. LynxTextListHelper (Header/Implementation)

**Purpose**: List manipulation operations and business logic

**Key Features**:
- List continuation logic (Enter key behavior)
- List type toggling and conversion
- List item indentation
- List item movement (up/down)

**Key Result Types**:
```objc
@interface LynxListContinuationResult : NSObject
@property (nonatomic, assign) BOOL shouldContinue;
@property (nonatomic, assign) BOOL shouldExit;
@property (nonatomic, copy, nullable) NSString *markerToInsert;
@property (nonatomic, assign) LynxListType listType;
@end

@interface LynxListToggleResult : NSObject
@property (nonatomic, assign) BOOL success;
@property (nonatomic, copy) NSString *newParagraphText;
@property (nonatomic, assign) NSInteger cursorAdjustment;
@property (nonatomic, assign) BOOL wasRemoved;
@end

@interface LynxListConversionResult : NSObject
@property (nonatomic, assign) BOOL success;
@property (nonatomic, copy) NSString *newParagraphText;
@property (nonatomic, assign) NSInteger cursorAdjustment;
@property (nonatomic, assign) LynxListType fromType;
@property (nonatomic, assign) LynxListType toType;
@end
```

**Key Methods**:
```objc
// List continuation (Enter key)
+ (LynxListContinuationResult *)calculateListContinuation:(NSString *)paragraphText;
+ (NSRange)applyListContinuation:(NSMutableAttributedString *)attrString
                         atRange:(NSRange)range
                  paragraphRange:(NSRange)paragraphRange
                          result:(LynxListContinuationResult *)result
                      attributes:(NSDictionary *)attributes;

// List toggling
+ (LynxListToggleResult *)toggleBulletList:(NSString *)paragraphText;
+ (LynxListToggleResult *)toggleOrderedList:(NSString *)paragraphText;
+ (LynxListToggleResult *)toggleBlockquote:(NSString *)paragraphText;

// List conversion
+ (LynxListConversionResult *)convertListType:(NSString *)paragraphText;

// Indentation
+ (NSString *)indentParagraph:(NSString *)paragraphText;
+ (NSString *)outdentParagraph:(NSString *)paragraphText success:(BOOL *)outSuccess;

// Line movement
+ (BOOL)swapLines:(NSMutableAttributedString *)attrString
           range1:(NSRange)range1
           range2:(NSRange)range2;
```

**Example Usage**:
```objc
// Toggle bullet list
NSString *paragraph = @"Some text";
LynxListToggleResult *result = [LynxTextListHelper toggleBulletList:paragraph];

NSLog(@"New text: %@", result.newParagraphText);        // "• Some text"
NSLog(@"Cursor adjustment: %ld", result.cursorAdjustment); // 2
NSLog(@"Was removed: %d", result.wasRemoved);           // NO
```

### 3. Refactored LynxRichTextInput.m

The main implementation file now uses the helpers, resulting in:
- **Cleaner code**: Methods focus on UI logic, delegate to helpers for business logic
- **Better readability**: Less inline string manipulation
- **Easier maintenance**: Changes to list logic centralized in helpers

**Before**:
```objc
LYNX_UI_METHOD(toggleBulletList) {
    // 40+ lines of inline string manipulation
    BOOL isBulletList = [paragraphText hasPrefix:@"• "];
    NSString *newParagraphText;
    if (isBulletList) {
        newParagraphText = [paragraphText substringFromIndex:2];
        cursorAdjustment = -2;
    } else {
        newParagraphText = [@"• " stringByAppendingString:paragraphText];
        cursorAdjustment = 2;
    }
    // ... more code
}
```

**After**:
```objc
LYNX_UI_METHOD(toggleBulletList) {
    // Use helper
    LynxListToggleResult *result = [LynxTextListHelper toggleBulletList:paragraphText];

    // Apply result
    [attrString replaceCharactersInRange:paragraphRange
                              withString:result.newParagraphText];
    NSRange newSel = NSMakeRange(sel.location + result.cursorAdjustment, sel.length);
    // ... UI updates
}
```

## Benefits

### 1. Testability

The helpers can be tested independently without UIKit dependencies:

```objc
// Unit test example
- (void)testBulletListToggle {
    NSString *input = @"Some text";
    LynxListToggleResult *result = [LynxTextListHelper toggleBulletList:input];

    XCTAssertTrue(result.success);
    XCTAssertEqualObjects(result.newParagraphText, @"• Some text");
    XCTAssertEqual(result.cursorAdjustment, 2);
    XCTAssertFalse(result.wasRemoved);
}
```

### 2. Reusability

Helpers can be used in other components:

```objc
// Use in another view controller
NSString *text = self.someTextField.text;
LynxListMarkerInfo *info = [LynxTextListMarker detectMarkerInLine:text];

if (info.hasMarker) {
    // Handle list formatting
}
```

### 3. Maintainability

Changes to list logic are centralized:

- Want to change bullet character? Update `LynxTextListMarker`
- Want to add new list type? Add to `LynxListType` enum and implement handlers
- Want to change continuation behavior? Update `calculateListContinuation:`

### 4. Type Safety

Enums prevent typos and provide autocomplete:

```objc
// Before: String-based (error-prone)
if ([listType isEqualToString:@"bullet"]) { }

// After: Enum-based (type-safe)
if (info.listType == LynxListTypeBullet) { }
```

## Migration Guide

### Adding New List Types

1. Add to `LynxListType` enum in `LynxTextListMarker.h`
2. Implement detection in `detectMarkerInLine:`
3. Implement marker generation in `markerForListType:number:`
4. Add toggle method in `LynxTextListHelper`
5. Add LYNX_UI_METHOD in `LynxRichTextInput.m`

### Extending Functionality

Example: Add nested list support

1. Add indent level to `LynxListMarkerInfo`
2. Extend `detectMarkerInLine:` to detect indentation
3. Use `markerForListType:number:indentLevel:`
4. Update toggle methods to preserve indentation

## Testing Strategy

### Unit Tests for Helpers

```objc
@interface LynxTextListMarkerTests : XCTestCase
@end

@implementation LynxTextListMarkerTests

- (void)testDetectBulletMarker {
    LynxListMarkerInfo *info = [LynxTextListMarker detectMarkerInLine:@"• Item"];
    XCTAssertTrue(info.hasMarker);
    XCTAssertEqual(info.listType, LynxListTypeBullet);
    XCTAssertEqualObjects(info.marker, @"• ");
    XCTAssertEqualObjects(info.contentAfterMarker, @"Item");
}

- (void)testDetectOrderedMarker {
    NSInteger number = 0;
    BOOL isOrdered = [LynxTextListMarker isOrderedMarker:@"5. Item" number:&number];
    XCTAssertTrue(isOrdered);
    XCTAssertEqual(number, 5);
}

@end
```

### Integration Tests

```objc
@interface LynxRichTextInputTests : XCTestCase
@property (nonatomic, strong) LynxRichTextInput *richTextInput;
@end

@implementation LynxRichTextInputTests

- (void)testToggleBulletListIntegration {
    // Set initial text
    self.richTextInput.textView.text = @"Test item";

    // Simulate toggle
    [self.richTextInput toggleBulletList];

    // Verify result
    XCTAssertEqualObjects(self.richTextInput.textView.text, @"• Test item");
}

@end
```

## Performance Considerations

The refactoring maintains performance while improving code quality:

1. **No additional allocations**: Result objects are lightweight
2. **Pure functions**: Helpers don't maintain state
3. **Same algorithmic complexity**: Just better organized
4. **Lazy evaluation**: Markers generated only when needed

## Backward Compatibility

- **Public API unchanged**: All LYNX_UI_METHOD signatures remain the same
- **JavaScript interface**: No changes to JS bridge calls
- **Existing features**: All functionality preserved

## Future Enhancements

With this architecture, future improvements are easier:

1. **Task list support**: Already structured in enums
2. **Nested lists**: Add depth tracking to helpers
3. **Custom markers**: Extend marker generation
4. **Undo/redo**: Result objects can be used for command pattern
5. **List merging**: Add merge helpers
6. **Smart paste**: Use marker detection for formatting

## Summary

This refactoring transforms the iOS rich text editor from a monolithic implementation to a modular, testable architecture:

| Aspect | Before | After |
|--------|--------|-------|
| **Lines per method** | 40-100 | 20-40 |
| **Testability** | Requires UIKit mocking | Pure functions, no mocking |
| **Code reuse** | Copy-paste patterns | Shared helper methods |
| **Type safety** | String-based checks | Enum-based types |
| **Maintainability** | High coupling | Clear separation |

The result is production-ready code that's easier to understand, test, and extend.
