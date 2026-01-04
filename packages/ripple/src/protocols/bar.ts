/**
 * Bar Protocol - Stack-based navigation interfaces
 *
 * Block editor-inspired architecture where the Bar maintains a stack of frames.
 * Each frame can be action/input/sheet mode with its own controls.
 *
 * Example flow: [base] → [compose] → [media-picker] → [image-select]
 */

import type { ReactNode } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// ActionSlot - Individual action button definition
// ─────────────────────────────────────────────────────────────────────────────

export interface ActionSlot {
  /** Ionicons icon name */
  icon: string;
  /** Optional text label */
  label?: string;
  /** Press handler */
  onPress: () => void;
  /** Disabled state */
  disabled?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// BarFrame - Single frame in the stack
// ─────────────────────────────────────────────────────────────────────────────

export type BarMode = 'action' | 'input' | 'sheet';

export interface BarFrame {
  /** Unique frame identifier */
  id: string;
  /** Display mode for this frame */
  mode: BarMode;

  // Action mode configuration
  actions?: {
    /** Left side actions (back, cancel) */
    leading?: ActionSlot[];
    /** Center action (main/primary) */
    primary?: ActionSlot;
    /** Right side actions (secondary) */
    trailing?: ActionSlot[];
  };

  // Input mode configuration
  input?: {
    /** Placeholder text */
    placeholder?: string;
    /** Submit handler */
    onSubmit?: (value: string) => void;
    /** Cancel handler */
    onCancel?: () => void;
    /** Auto-focus on mount */
    autoFocus?: boolean;
    /** Left action button */
    leftAction?: ActionSlot;
    /** Right action button */
    rightAction?: ActionSlot;
    /** Show send button */
    showSendButton?: boolean;
    /** Keep input open after submit (for chat interfaces) */
    persistent?: boolean;
  };

  // Sheet mode configuration
  sheet?: {
    /** Sheet content */
    content: ReactNode;
    /** Fixed height (if not provided, auto-sizes) */
    height?: number | 'auto';
  };

  // Navigation behavior
  /** Custom back behavior (default: pop) */
  onBack?: () => void;
  /** Allow backdrop tap to dismiss (default: true) */
  canDismiss?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// BarStore - Stack-based state management interface
// ─────────────────────────────────────────────────────────────────────────────

export interface BarStoreState {
  /** Frame stack (first is base, last is current) */
  stack: BarFrame[];
  /** Current input value (shared across frames) */
  inputValue: string;
}

export interface BarStoreActions {
  // Stack operations
  /** Push a new frame onto the stack */
  push: (frame: BarFrame) => void;
  /** Pop the current frame (returns to previous) */
  pop: () => void;
  /** Replace current frame with a new one */
  replace: (frame: BarFrame) => void;
  /** Reset to base frame only */
  reset: () => void;

  // Quick helpers (push specialized frames)
  /** Open input mode with config */
  openInput: (config?: BarFrame['input']) => void;
  /** Open sheet mode with content */
  openSheet: (content: ReactNode, options?: Omit<BarFrame['sheet'], 'content'>) => void;
  /** Set actions on current frame */
  setActions: (actions: BarFrame['actions']) => void;

  // Input value
  /** Set input value */
  setInputValue: (value: string) => void;
  /** Clear input value */
  clearInputValue: () => void;
}

export type BarStore = BarStoreState & BarStoreActions;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Get current (top) frame from stack */
export function getCurrentFrame(stack: BarFrame[]): BarFrame | null {
  return stack.length > 0 ? stack[stack.length - 1] : null;
}

/** Check if stack has more than base frame */
export function canGoBack(stack: BarFrame[]): boolean {
  return stack.length > 1;
}

/** Create a base frame with optional actions */
export function createBaseFrame(actions?: BarFrame['actions']): BarFrame {
  return {
    id: 'base',
    mode: 'action',
    actions,
    canDismiss: false,
  };
}
