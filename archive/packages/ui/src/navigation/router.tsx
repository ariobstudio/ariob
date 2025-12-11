/**
 * Navigation helpers for cross-bundle navigation using ExplorerModule.
 * Provides utilities for opening bundles, navigating back, and scanning QR codes.
 */

import type { LynxReactNode } from '../types/react';

const PREFIX = 'file://lynx?local://app/';
const SUFFIX = '.lynx.bundle';

export type Options = {
  params?: Record<string, string | number | boolean>;
  fullscreen?: boolean;
};

const build = (bundle: string, options: Options = {}): string => {
  const { params: pairs = {}, fullscreen = false } = options;
  const query = new URLSearchParams();

  if (fullscreen) {
    query.append('fullscreen', 'true');
  }

  Object.entries(pairs).forEach(([key, value]) => {
    query.append(key, String(value));
  });

  const suffix = query.toString();
  const base = `${PREFIX}${bundle}${SUFFIX}`;

  return suffix ? `${base}?${suffix}` : base;
};

/**
 * Opens a bundle using the ExplorerModule native navigation.
 * This is for cross-bundle navigation (navigating between different .lynx.bundle files).
 */
export const open = (bundle: string, options: Options = {}) => {
  if (typeof NativeModules === 'undefined' || !NativeModules.ExplorerModule) {
    console.warn('ExplorerModule unavailable.');
    return;
  }

  NativeModules.ExplorerModule.openSchema(build(bundle, options));
};

/**
 * Navigates back using the ExplorerModule.
 */
export const back = () => {
  if (typeof NativeModules === 'undefined' || !NativeModules.ExplorerModule) {
    return;
  }

  NativeModules.ExplorerModule.navigateBack();
};

/**
 * Opens the QR code scanner using the ExplorerModule.
 */
export const scan = () => {
  if (typeof NativeModules === 'undefined' || !NativeModules.ExplorerModule) {
    return;
  }

  NativeModules.ExplorerModule.openScan();
};

type JumpProps = {
  bundle?: string;
  options?: Options;
  children?: LynxReactNode;
  onPress?: () => void;
  [key: string]: any;
};

/**
 * Jump component for cross-bundle navigation.
 * When bundle is provided, tapping opens that bundle.
 * When onPress is provided without bundle, calls the handler.
 */
export const Jump = ({ bundle, options, children, onPress, ...rest }: JumpProps) => {
  const handleTap = () => {
    if (bundle) {
      open(bundle, options);
    } else if (onPress) {
      onPress();
    }
  };

  return <view bindtap={handleTap} {...rest}>{children}</view>;
};

export type Tab = {
  name: string;
  bundle: string;
  icon?: string;
  label?: string;
};

/**
 * Creates a tabs navigation helper for cross-bundle tab navigation.
 */
export const tabs = (items: Tab[]) => ({
  items,
  go: (name: string) => {
    const tab = items.find((item) => item.name === name);
    if (!tab) {
      return;
    }

    open(tab.bundle);
  },
});

/**
 * Creates a stack navigation helper for cross-bundle stack navigation.
 */
export const stack = () => ({
  push: (bundle: string, options?: Options) => open(bundle, options),
  pop: () => back(),
});
