/**
 * LynxJS-specific exports for @ariob/core
 *
 * This entry point provides access to LynxJS-specific functionality including:
 * - Native module type declarations
 * - Main Thread Scripting (MTS) hooks
 * - LynxJS-optimized components
 *
 * Usage in LynxJS apps:
 * ```typescript
 * import { useMainThreadImperativeHandle, useTapLock } from '@ariob/core/lynx';
 * ```
 *
 * Note: These exports require LynxJS runtime and will not work in standard React Native or Expo.
 */

// Re-export LynxJS-specific hooks
export * from './hooks';

// Type declarations are automatically included via lynx/typing.d.ts
