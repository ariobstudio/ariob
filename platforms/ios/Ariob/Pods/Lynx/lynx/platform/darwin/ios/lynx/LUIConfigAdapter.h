// Copyright 2025 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
#import <Lynx/LUIConfig.h>

#include "core/renderer/page_config.h"

@interface LUIConfigAdapter : NSObject <LUIConfig>
- (instancetype)initWithConfig:(lynx::tasm::PageConfig*)pageConfig;
@end
