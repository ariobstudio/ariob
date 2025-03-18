//
//  AppDelegate.m
//  Ariob
//
//  Created by Natnael Teferi on 3/16/25.
//

#import "AppDelegate.h"
#import "LynxDebugger.h"
#import "LynxInitProcessor.h"
#import "ViewController.h"


@interface AppDelegate ()

@end

@implementation AppDelegate


- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    // Override point for customization after application launch.
    [[LynxInitProcessor sharedInstance] setupEnvironment];
  
    self.window = [[UIWindow alloc] initWithFrame:[[UIScreen mainScreen] bounds]];
    
    UINavigationController *navigationController =
    [[UINavigationController alloc] init];
    navigationController.navigationBar.hidden = YES;
    [navigationController setNavigationBarHidden:YES];
    navigationController.navigationBar.translucent = YES;
    self.window.rootViewController = navigationController;
    self.window.backgroundColor = [UIColor whiteColor];
    [self.window makeKeyAndVisible];
  
    [LynxDebugger addOpenCardCallback:^(NSString *url) {
      dispatch_async(dispatch_get_main_queue(), ^{
        
      });
    }];
  
    dispatch_async(dispatch_get_main_queue(), ^{
      ViewController *viewController = [[ViewController alloc] init];
    
      [navigationController pushViewController:viewController animated:YES];
    });

    return YES;
}

@end
