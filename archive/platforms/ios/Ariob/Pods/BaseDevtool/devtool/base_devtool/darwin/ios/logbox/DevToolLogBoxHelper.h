// Copyright 2022 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
#ifndef DEVTOOL_BASE_DEVTOOL_DARWIN_IOS_LOGBOX_DEVTOOLLOGBOXHELPER_H_
#define DEVTOOL_BASE_DEVTOOL_DARWIN_IOS_LOGBOX_DEVTOOLLOGBOXHELPER_H_

#if OS_OSX

#define UIViewController NSViewController
#define UIResponder NSResponder
#define UIView NSView
#define UIButton NSView
#define UIColor NSColor
#define UIFont NSFont
#define UILabel NSTextField
#define UITapGestureRecognizer NSClickGestureRecognizer

#endif

#endif  // DEVTOOL_BASE_DEVTOOL_DARWIN_IOS_LOGBOX_DEVTOOLLOGBOXHELPER_H_
