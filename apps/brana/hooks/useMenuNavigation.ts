/**
 * Hook for keyboard navigation in menus
 * Implements roving tabindex pattern with arrow key navigation
 */
import { useState, useEffect, useCallback } from 'react';

/**
 * Options for menu navigation behavior
 */
export interface MenuNavigationOptions {
  /** Number of items in the menu */
  itemCount: number;
  /** Callback when an item is selected (Enter/Space) */
  onSelect: (index: number) => void;
  /** Callback when menu should close (Escape) */
  onClose: () => void;
  /** Menu orientation for arrow key direction */
  orientation?: 'horizontal' | 'vertical';
  /** Whether to wrap around at ends */
  wrap?: boolean;
}

/**
 * Return type for useMenuNavigation hook
 */
export interface MenuNavigationResult {
  /** Currently selected item index */
  selectedIndex: number;
  /** Set the selected index directly */
  setSelectedIndex: (index: number) => void;
  /** Move to next item */
  selectNext: () => void;
  /** Move to previous item */
  selectPrevious: () => void;
  /** Select first item */
  selectFirst: () => void;
  /** Select last item */
  selectLast: () => void;
}

/**
 * Hook for managing keyboard navigation in menus
 * Handles arrow keys, Home/End, Enter/Space, Escape, and Tab
 *
 * @param visible - Whether the menu is currently visible
 * @param options - Navigation options
 * @returns Navigation state and control functions
 *
 * @example
 * ```tsx
 * const { selectedIndex, setSelectedIndex } = useMenuNavigation(
 *   showMenu,
 *   {
 *     itemCount: commands.length,
 *     onSelect: (index) => handleCommand(commands[index]),
 *     onClose: () => setShowMenu(false),
 *   }
 * );
 * ```
 */
export function useMenuNavigation(
  visible: boolean,
  options: MenuNavigationOptions
): MenuNavigationResult {
  const {
    itemCount,
    onSelect,
    onClose,
    orientation = 'horizontal',
    wrap = true,
  } = options;

  const [selectedIndex, setSelectedIndex] = useState(0);

  // Reset selection when menu opens
  useEffect(() => {
    if (visible) {
      setSelectedIndex(0);
    }
  }, [visible]);

  const selectNext = useCallback(() => {
    setSelectedIndex((prev) => {
      if (wrap) {
        return (prev + 1) % itemCount;
      }
      return Math.min(prev + 1, itemCount - 1);
    });
  }, [itemCount, wrap]);

  const selectPrevious = useCallback(() => {
    setSelectedIndex((prev) => {
      if (wrap) {
        return (prev - 1 + itemCount) % itemCount;
      }
      return Math.max(prev - 1, 0);
    });
  }, [itemCount, wrap]);

  const selectFirst = useCallback(() => {
    setSelectedIndex(0);
  }, []);

  const selectLast = useCallback(() => {
    setSelectedIndex(itemCount - 1);
  }, [itemCount]);

  // Keyboard event handler
  useEffect(() => {
    if (!visible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const nextKey = orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown';
      const prevKey = orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';

      switch (e.key) {
        case nextKey:
          e.preventDefault();
          e.stopPropagation();
          selectNext();
          break;

        case prevKey:
          e.preventDefault();
          e.stopPropagation();
          selectPrevious();
          break;

        case 'Home':
          e.preventDefault();
          e.stopPropagation();
          selectFirst();
          break;

        case 'End':
          e.preventDefault();
          e.stopPropagation();
          selectLast();
          break;

        case 'Tab':
          // Tab cycles through menu items
          e.preventDefault();
          e.stopPropagation();
          if (e.shiftKey) {
            selectPrevious();
          } else {
            selectNext();
          }
          break;

        case 'Enter':
        case ' ':
          if (selectedIndex >= 0 && selectedIndex < itemCount) {
            e.preventDefault();
            e.stopPropagation();
            onSelect(selectedIndex);
          }
          break;

        case 'Escape':
          e.preventDefault();
          e.stopPropagation();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [visible, selectedIndex, itemCount, onSelect, onClose, orientation, selectNext, selectPrevious, selectFirst, selectLast]);

  return {
    selectedIndex,
    setSelectedIndex,
    selectNext,
    selectPrevious,
    selectFirst,
    selectLast,
  };
}

export default useMenuNavigation;
