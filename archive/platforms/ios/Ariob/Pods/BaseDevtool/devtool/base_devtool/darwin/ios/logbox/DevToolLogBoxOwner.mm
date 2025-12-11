// Copyright 2022 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
#import "DevToolLogBoxOwner.h"
#import "DevToolLogBoxManager.h"

@interface DevToolLogBoxOwner ()

- (void)showNotificationWithController:(UIViewController *)controller;
- (void)hideNotificationWithController:(UIViewController *)controller;

@end

#pragma mark - DevToolViewControllerLifeListener
@interface DevToolViewControllerLifeListener : UIViewController
@end

@implementation DevToolViewControllerLifeListener

#if OS_IOS
- (void)viewWillAppear:(BOOL)animated {
  [[DevToolLogBoxOwner getInstance] showNotificationWithController:[self parentViewController]];
}

- (void)viewWillDisappear:(BOOL)animated {
  [[DevToolLogBoxOwner getInstance] hideNotificationWithController:[self parentViewController]];
}

- (void)viewWillLayoutSubviews {
  [super viewWillLayoutSubviews];
  // The frame may be changed by the host, so we reset the frame here every time.
  self.view.frame = CGRectMake(0, 0, 0, 0);
}

#else
- (void)viewWillAppear {
  [[DevToolLogBoxOwner getInstance] showNotificationWithController:[self parentViewController]];
}

- (void)viewWillDisappear {
  [[DevToolLogBoxOwner getInstance] hideNotificationWithController:[self parentViewController]];
}
#endif

@end

#pragma mark - DevToolLogBoxOwner
@implementation DevToolLogBoxOwner {
  NSMapTable *_controllerToManager;
  NSMapTable *_proxyToController;
}

+ (DevToolLogBoxOwner *)getInstance {
  static DevToolLogBoxOwner *_instance = nil;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    _instance = [[self alloc] init];
  });
  return _instance;
}

- (nonnull instancetype)init {
  self = [super init];
  if (self) {
    _controllerToManager = [NSMapTable weakToStrongObjectsMapTable];
    _proxyToController = [NSMapTable weakToWeakObjectsMapTable];
  }
  return self;
}

- (void)insertLogBoxProxy:(DevToolLogBoxProxy *)proxy
           withController:(UIViewController *)controller {
  if ([NSThread isMainThread]) {
    [self insertLogBoxProxyOnMainThread:proxy withController:controller];
  } else {
    __weak __typeof(self) weakSelf = self;
    dispatch_async(dispatch_get_main_queue(), ^{
      __strong __typeof(weakSelf) strongSelf = weakSelf;
      [strongSelf insertLogBoxProxyOnMainThread:proxy withController:controller];
    });
  }
}

- (void)insertLogBoxProxyOnMainThread:(DevToolLogBoxProxy *)proxy
                       withController:(UIViewController *)controller {
  [_proxyToController setObject:controller forKey:proxy];
  if ([_controllerToManager objectForKey:controller] == nil) {
    [_controllerToManager setObject:[[DevToolLogBoxManager alloc] initWithViewController:controller]
                             forKey:controller];

    DevToolViewControllerLifeListener *listener = [[DevToolViewControllerLifeListener alloc] init];
    [controller addChildViewController:listener];
#if OS_OSX
    listener.view = [[NSView alloc] init];
#endif
    [controller.view addSubview:listener.view];
#if OS_IOS
    [listener didMoveToParentViewController:controller];
#endif
  }
}

- (void)onNewLog:(NSString *)message
       withLevel:(NSString *)level
       withProxy:(DevToolLogBoxProxy *)proxy {
  DevToolLogBoxManager *manager = [self getLogBoxManagerWithProxy:proxy];
  [manager onNewLog:message withLevel:level withProxy:proxy];
}

- (void)updateEntryUrlForLogSrc:(NSString *)url withProxy:(DevToolLogBoxProxy *)proxy {
  DevToolLogBoxManager *manager = [self getLogBoxManagerWithProxy:proxy];
  [manager updateEntryUrlForLogSrc:url withProxy:proxy];
}

- (void)onProxyReset:(DevToolLogBoxProxy *)proxy {
  DevToolLogBoxManager *manager = [self getLogBoxManagerWithProxy:proxy];
  [manager onProxyReset:proxy];
}

- (void)showNotificationWithController:(UIViewController *)controller {
  DevToolLogBoxManager *manager = [_controllerToManager objectForKey:controller];
  [manager showNotification];
}

- (void)hideNotificationWithController:(UIViewController *)controller {
  DevToolLogBoxManager *manager = [_controllerToManager objectForKey:controller];
  [manager hideNotification];
}

- (DevToolLogBoxManager *)getLogBoxManagerWithProxy:(DevToolLogBoxProxy *)proxy {
  UIViewController *controller = [_proxyToController objectForKey:proxy];
  return [_controllerToManager objectForKey:controller];
}

@end
