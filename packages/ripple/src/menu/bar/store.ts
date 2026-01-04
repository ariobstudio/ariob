/**
 * Bar Store - Stack-based navigation
 *
 * Block editor-inspired architecture where the Bar maintains a stack of frames.
 * Each frame can be action/input/sheet mode with its own controls.
 *
 * Stack operations:
 * - push(frame) - Add new frame to stack
 * - pop() - Remove current frame, go back
 * - replace(frame) - Replace current frame
 * - reset() - Clear to base frame only
 *
 * Quick helpers:
 * - openInput(config) - Push input frame
 * - openSheet(content) - Push sheet frame
 * - setActions(actions) - Update current frame actions
 */

import { create } from 'zustand';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { ReactNode } from 'react';
import type {
  BarStore,
  BarFrame,
  BarMode,
  ActionSlot,
} from '../../protocols/bar';
import { getCurrentFrame, canGoBack, createBaseFrame } from '../../protocols/bar';

// ─────────────────────────────────────────────────────────────────────────────
// Haptic Helpers
// ─────────────────────────────────────────────────────────────────────────────

function hapticSelection() {
  if (Platform.OS !== 'web') Haptics.selectionAsync();
}

function hapticImpact() {
  if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

// ─────────────────────────────────────────────────────────────────────────────
// Store Implementation
// ─────────────────────────────────────────────────────────────────────────────

export const useBarStore = create<BarStore>((set, get) => ({
  // Initial state: single base frame
  stack: [createBaseFrame()],
  inputValue: '',

  // ─────────────────────────────────────────────────────────────────────────
  // Stack Operations
  // ─────────────────────────────────────────────────────────────────────────

  push: (frame: BarFrame) => {
    hapticImpact();
    set((state) => ({
      stack: [...state.stack, frame],
    }));
  },

  pop: () => {
    const { stack } = get();
    if (!canGoBack(stack)) return;

    hapticSelection();
    set((state) => ({
      stack: state.stack.slice(0, -1),
      // Clear input value when popping input frame
      inputValue: getCurrentFrame(state.stack)?.mode === 'input' ? '' : state.inputValue,
    }));
  },

  replace: (frame: BarFrame) => {
    hapticSelection();
    set((state) => ({
      stack: [...state.stack.slice(0, -1), frame],
    }));
  },

  reset: () => {
    hapticSelection();
    set((state) => ({
      stack: [state.stack[0] || createBaseFrame()],
      inputValue: '',
    }));
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Quick Helpers
  // ─────────────────────────────────────────────────────────────────────────

  openInput: (config?: BarFrame['input']) => {
    const { push } = get();
    push({
      id: `input-${Date.now()}`,
      mode: 'input',
      input: {
        autoFocus: true,
        showSendButton: true,
        ...config,
      },
      canDismiss: true,
    });
  },

  openSheet: (content: ReactNode, options?: Omit<BarFrame['sheet'], 'content'>) => {
    const { push } = get();
    push({
      id: `sheet-${Date.now()}`,
      mode: 'sheet',
      sheet: {
        content,
        height: 'auto',
        ...options,
      },
      canDismiss: true,
    });
  },

  setActions: (actions: BarFrame['actions']) => {
    const { stack } = get();
    const current = getCurrentFrame(stack);
    if (!current) return;

    set((state) => {
      const newStack = [...state.stack];
      const lastIndex = newStack.length - 1;
      newStack[lastIndex] = {
        ...newStack[lastIndex],
        actions,
      };
      return { stack: newStack };
    });
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Input Value
  // ─────────────────────────────────────────────────────────────────────────

  setInputValue: (inputValue: string) => set({ inputValue }),

  clearInputValue: () => set({ inputValue: '' }),
}));

// ─────────────────────────────────────────────────────────────────────────────
// Selector Hooks
// ─────────────────────────────────────────────────────────────────────────────

/** Get current mode from top frame */
export const useBarMode = (): BarMode => {
  return useBarStore((s) => getCurrentFrame(s.stack)?.mode ?? 'action');
};

/** Get current input value */
export const useBarInputValue = () => useBarStore((s) => s.inputValue);

/** Get current frame */
export const useCurrentFrame = () => {
  return useBarStore((s) => getCurrentFrame(s.stack));
};

/** Check if can go back */
export const useCanGoBack = () => {
  return useBarStore((s) => canGoBack(s.stack));
};

/** Get stack depth */
export const useStackDepth = () => {
  return useBarStore((s) => s.stack.length);
};

// Legacy: visibility is always true in new API (apps control rendering)
export const useBarVisible = () => true;

/**
 * Get stable action methods from the store
 * Use this in useEffect to avoid infinite loops
 */
export const useBarActions = () => {
  return useBarStore((s) => ({
    push: s.push,
    pop: s.pop,
    replace: s.replace,
    reset: s.reset,
    openInput: s.openInput,
    openSheet: s.openSheet,
    setActions: s.setActions,
    setInputValue: s.setInputValue,
    clearInputValue: s.clearInputValue,
  }));
};

// ─────────────────────────────────────────────────────────────────────────────
// Re-exports
// ─────────────────────────────────────────────────────────────────────────────

export type { BarMode, BarFrame, ActionSlot, BarStore } from '../../protocols/bar';
