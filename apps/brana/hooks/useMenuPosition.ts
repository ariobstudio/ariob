/**
 * Hook for clamping menu positions within viewport bounds
 * Ensures menus are always visible and properly positioned
 */
import { useMemo } from 'react';

export interface MenuPosition {
  top: number;
  left: number;
}

export interface ClampOptions {
  flipBelow?: boolean;
  flipAbove?: boolean;
  originalTop?: number;
  centerX?: boolean;
}

/**
 * Clamp menu position within container bounds with optional flipping
 * Note: This now works with container-relative coordinates (for position: absolute)
 */
export function clampMenuPosition(
  position: MenuPosition,
  menuWidth: number,
  menuHeight: number,
  options: ClampOptions = {}
): MenuPosition {
  const { flipBelow = false, flipAbove = false, originalTop, centerX = false } = options;
  const padding = 16;

  let { top, left } = position;

  // Horizontal clamping - keep within container
  if (centerX) {
    // Center the menu horizontally around the left position
    left = left - menuWidth / 2;
  }

  // Ensure menu doesn't overflow container horizontally
  if (left < 0) {
    left = padding;
  }

  // Vertical clamping - flip below if too close to top
  if (flipBelow && top < menuHeight + padding) {
    top = (originalTop ?? position.top) + 40;
  }

  // Flip above if needed (when menu would be cut off at bottom)
  if (flipAbove && top + menuHeight > window.innerHeight - padding) {
    top = (originalTop ?? position.top) - menuHeight - 8;
  }

  // Ensure menu stays within visible area
  if (top < 0) {
    top = padding;
  }

  return { top, left };
}

/**
 * Hook for clamping menu position within viewport
 */
export function useMenuPosition(
  rawPosition: MenuPosition,
  menuWidth: number,
  menuHeight: number,
  options: ClampOptions = {}
): MenuPosition {
  return useMemo(
    () => clampMenuPosition(rawPosition, menuWidth, menuHeight, options),
    [rawPosition.top, rawPosition.left, menuWidth, menuHeight, options.flipBelow, options.flipAbove, options.centerX]
  );
}
