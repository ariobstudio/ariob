import type * as React from '@lynx-js/react';

/**
 * Lynx currently relies on React 18-style JSX intrinsic types that do not
 * include `bigint` in `ReactNode`. Some of our packages pull in the React 19
 * type definitions (which now include `bigint`), so we normalize the shape
 * of ReactNode here to keep our props compatible with the Lynx JSX runtime.
 */
export type LynxReactNode = Exclude<React.ReactNode, bigint>;
