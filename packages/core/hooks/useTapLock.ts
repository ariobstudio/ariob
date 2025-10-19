/**
 * useTapLock Hook
 *
 * MTS-based hook for distinguishing between taps and drags based on movement threshold.
 * Inspired by reactlynx-use patterns for optimal performance.
 *
 * Uses Main Thread Scripting (MTS) with useMainThreadRef for 60fps interactions.
 */

import { useMainThreadRef } from '@lynx-js/react';
import type { MainThread } from '@lynx-js/types';

const TAP_THRESHOLD = 8;

type TapLockDirection = 'x' | 'y' | 'both';

interface UseTapLockOptions {
  tapThreshold?: number;
  direction?: TapLockDirection;
}

/**
 * Hook for detecting tap vs drag interactions using movement threshold.
 *
 * @param options Configuration for threshold and direction
 * @returns Object with refs and MTS event handlers
 *
 * @example
 * ```typescript
 * const { tapLockRef, handleTouchStart, handleTouchMove, handleTouchEnd } = useTapLock();
 *
 * // In component:
 * <view
 *   bindtouchstart={handleTouchStart}
 *   bindtouchmove={handleTouchMove}
 *   bindtouchend={handleTouchEnd}
 * >
 *   {tapLockRef.current && <text>Tap!</text>}
 * </view>
 * ```
 */
function useTapLock(options: UseTapLockOptions = {}) {
  const { tapThreshold = TAP_THRESHOLD, direction = 'both' } = options;

  // Main thread refs for performance-critical state
  const tapLockRef = useMainThreadRef<boolean>(true);
  const touchStartXRef = useMainThreadRef<number>(0);
  const touchStartYRef = useMainThreadRef<number>(0);

  /**
   * Initialize tap lock on touch start
   * MTS directive ensures this runs on main thread
   */
  function handleTouchStart(event: MainThread.TouchEvent) {
    'main thread';
    tapLockRef.current = true;
    touchStartXRef.current = event.detail.x;
    touchStartYRef.current = event.detail.y;
  }

  /**
   * Check if movement exceeds threshold
   * Returns true if still locked (tap), false if unlocked (drag)
   */
  function checkThreshold(event: MainThread.TouchEvent): boolean {
    'main thread';
    const deltaX = event.detail.x - touchStartXRef.current;
    const deltaY = event.detail.y - touchStartYRef.current;

    let shouldUnlock = false;

    if (direction === 'x') {
      shouldUnlock = Math.abs(deltaX) > tapThreshold;
    } else if (direction === 'y') {
      shouldUnlock = Math.abs(deltaY) > tapThreshold;
    } else if (direction === 'both') {
      shouldUnlock = Math.abs(deltaX) > tapThreshold || Math.abs(deltaY) > tapThreshold;
    }

    if (shouldUnlock) {
      tapLockRef.current = false;
    }
    return tapLockRef.current;
  }

  /**
   * Handle touch move - check if drag has started
   */
  function handleTouchMove(event: MainThread.TouchEvent) {
    'main thread';
    return checkThreshold(event);
  }

  /**
   * Handle touch end - final threshold check
   */
  function handleTouchEnd(event: MainThread.TouchEvent) {
    'main thread';
    return checkThreshold(event);
  }

  return {
    tapLockRef,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
}

export default useTapLock;
export type { UseTapLockOptions, TapLockDirection };
