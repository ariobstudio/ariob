//
//  LynxBlockComponents.h
//  Ariob
//
//  Header file for block component declarations.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import <Lynx/LynxUI.h>

NS_ASSUME_NONNULL_BEGIN

// MARK: - List Components

@interface LynxListBlock : LynxUI<UIStackView *>
@end

@interface LynxListItem : LynxUI<UIView *> <UITextFieldDelegate>
- (void)updateMarkerWithType:(NSString *)type index:(NSInteger)index startNumber:(NSInteger)startNumber;
@end

// MARK: - Block Components

@interface LynxHeadingBlock : LynxUI<UITextField *> <UITextFieldDelegate>
@end

@interface LynxParagraphBlock : LynxUI<UITextField *> <UITextFieldDelegate>
@end

@interface LynxBlockquoteBlock : LynxUI<UIView *> <UITextFieldDelegate>
@end

// MARK: - Registration

@interface LynxBlockComponentsRegistry : NSObject
+ (void)registerComponents;
@end

NS_ASSUME_NONNULL_END
