//
//  LynxInitProcessor.m
//  Ariob
//
//  Created by Natnael Teferi on 3/16/25.
//


// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

#import "LynxInitProcessor.h"
#import <Lynx/LynxConfig.h>
#import <Lynx/LynxEnv.h>
#import <SDWebImage/SDWebImage.h>
#import <SDWebImageWebPCoder/SDWebImageWebPCoder.h>
#import "NetworkLynxProvider.h"
#import "ExplorerModule.h"
#import "Ariob-Swift.h"

@implementation LynxInitProcessor

static LynxInitProcessor *_instance = nil;

+ (instancetype)sharedInstance {
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    _instance = [[self alloc] init];
  });
  return _instance;
}

- (void)setupEnvironment {
  [self setupLynxEnv];
  [self setupLynxService];
}

- (void)setupLynxEnv {
  LynxEnv *env = [LynxEnv sharedInstance];
  // init global config
  LynxConfig *globalConfig = [[LynxConfig alloc] initWithProvider:[NetworkLynxProvider new]];
  // register global JS module
  [globalConfig registerModule:ExplorerModule.class];
  [globalConfig registerModule:NativeWebCryptoModule.class];
  [globalConfig registerModule:NativeLocalStorageModule.class];

  // prepare global config
  [[LynxEnv sharedInstance] prepareConfig:globalConfig];
}

- (void)setupLynxService {
  // prepare lynx service
  SDImageWebPCoder *webPCoder = [SDImageWebPCoder sharedCoder];
  [[SDImageCodersManager sharedManager] addCoder:webPCoder];
}

@end
