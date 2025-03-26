//
//  ViewController.m
//  Ariob
//
//  Created by Natnael Teferi on 3/16/25.
//

#import <Lynx/LynxView.h>
#import <Lynx/LynxEnv.h>

#import "ViewController.h"
#import "NetworkLynxProvider.h"

@implementation ViewController

- (void)viewDidLoad {
  [super viewDidLoad];
  LynxView *lynxView = [[LynxView alloc] initWithBuilderBlock:^(LynxViewBuilder *builder) {
    builder.config = [[LynxConfig alloc] initWithProvider:[LynxEnv sharedInstance].config.templateProvider];
    builder.screenSize = self.view.frame.size;
    builder.fontScale = 1.0;
  }];
  lynxView.preferredLayoutWidth = self.view.frame.size.width;
  lynxView.preferredLayoutHeight = self.view.frame.size.height;
  lynxView.layoutWidthMode = LynxViewSizeModeExact;
  lynxView.layoutHeightMode = LynxViewSizeModeExact;
  [self.view addSubview:lynxView];
  
  [lynxView loadTemplateFromURL:@"http://10.0.0.13:3000/main.lynx.bundle?fullscreen=true" initData:nil];
  [lynxView triggerLayout];
}
- (void)viewWillAppear:(BOOL)animated {
  [super viewWillAppear:animated];
  [self.navigationController setNavigationBarHidden:YES animated:NO];
}

@end

