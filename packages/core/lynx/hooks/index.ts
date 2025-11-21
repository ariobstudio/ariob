/**
 * LynxJS-specific hooks
 *
 * These hooks are designed for use in LynxJS applications and leverage
 * LynxJS-specific features like Main Thread Scripting (MTS) and native modules.
 */

export { default as useMainThreadImperativeHandle } from './useMainThreadImperativeHandle';
export { default as useTapLock } from './useTapLock';
export { useKeyboard } from './useKeyboard';

export type { UseTapLockOptions, TapLockDirection } from './useTapLock';
export type { UseKeyboardResult } from './useKeyboard';
