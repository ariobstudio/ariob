/**
 * Bar Types - Types for the slot-based Bar component
 *
 * New slot-based API types and legacy types for backward compatibility.
 */

// Re-export base types
export type { Act, Acts, View, Full, Pick } from '../types';
import type { ActionContext } from '../provider';

// ─────────────────────────────────────────────────────────────────────────────
// New Slot-Based API Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Bar modes
 * - action: Default pill with action buttons
 * - input: Full-width text input
 * - sheet: Expanded nested interface
 */
export type BarMode = 'action' | 'input' | 'sheet';

/**
 * New Bar props (slot-based)
 */
export interface NewBarProps {
  /** Current display mode */
  mode: BarMode;
  /** Slot children (Bar.Actions, Bar.Input, Bar.Sheet) */
  children: React.ReactNode;
  /** Callback when backdrop/sheet is dismissed */
  onDismiss?: () => void;
}

/**
 * Bar.Button props
 */
export interface NewBarButtonProps {
  /** Ionicons icon name */
  icon: string;
  /** Optional text label */
  label?: string;
  /** Press handler */
  onPress: () => void;
  /** Position in the bar */
  position?: 'left' | 'center' | 'right';
  /** Disable the button */
  disabled?: boolean;
}

/**
 * Bar.Actions props
 */
export interface NewBarActionsProps {
  /** Action buttons to render */
  children: React.ReactNode;
}

/**
 * Bar.Input props
 */
export interface NewBarInputProps {
  /** Controlled input value */
  value?: string;
  /** Value change handler */
  onChangeText?: (text: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Submit handler */
  onSubmit?: (text: string) => void;
  /** Cancel handler */
  onCancel?: () => void;
  /** Auto-focus on mount */
  autoFocus?: boolean;
  /** Left action button */
  leftButton?: { icon: string; onPress: () => void };
  /** Right action button */
  rightButton?: { icon: string; onPress: () => void };
  /** Show send button */
  showSendButton?: boolean;
}

/**
 * Bar.Sheet props
 */
export interface NewBarSheetProps {
  /** Sheet content */
  children: React.ReactNode;
}

// ─────────────────────────────────────────────────────────────────────────────
// Legacy Types (for backward compatibility)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Height constraints for dynamic sheet sizing
 * @deprecated Use slot-based Bar.Sheet instead
 */
export interface SheetHeightConstraints {
  /** Minimum height in pixels (default: 200) */
  min?: number;
  /** Maximum height in pixels (default: screen height - 100) */
  max?: number;
  /** Initial height before measurement (default: 280) */
  initial?: number;
}

/**
 * Sheet types that can be shown in sheet mode
 */
export type SheetType =
  | 'compose'
  | 'ai-config'
  | 'account'
  | 'degree'
  | 'media'
  | null;

/**
 * Bar actions for state transitions
 */
/**
 * Bar store state (matches the exported `useBar` store in `Bar.tsx`)
 */
export interface BarState {
  mode: BarMode;
  sheet: SheetType;

  left: Act | null;
  center: Act | null;
  right: Act | null;

  inputLeft: Act | null;
  inputRight: Act | null;
  showSendButton: boolean;

  placeholder: string;
  value: string;
  autoFocus: boolean;

  visible: boolean;
  isActive: boolean;
  persistInputMode: boolean;

  onAction: ((action: string) => void) | null;
  onSubmit: ((text: string) => void) | null;
  onCancel: (() => void) | null;
}

/**
 * Bar store actions (matches the exported `useBar` store in `Bar.tsx`)
 */
export interface BarActions {
  setMode: (mode: BarMode) => void;
  setActions: (acts: { left?: Act | null; center?: Act | null; right?: Act | null }) => void;
  setInputLeft: (act: Act | null) => void;
  setInputRight: (act: Act | null) => void;
  setValue: (value: string) => void;
  setPlaceholder: (placeholder: string) => void;
  show: () => void;
  hide: () => void;
  setActive: (active: boolean) => void;
  setCallbacks: (cb: {
    onAction?: ((action: string) => void) | null;
    onSubmit?: ((text: string) => void) | null;
    onCancel?: (() => void) | null;
  }) => void;
  configure: (config: Partial<BarState>) => void;
  reset: () => void;
  openSheet: (type: NonNullable<SheetType>) => void;
  closeSheet: () => void;
}

/**
 * Configuration for an action button slot
 */
export interface ActionSlot {
  /** Action definition */
  act: Act;
  /** Position in the bar */
  position: 'left' | 'center' | 'right';
}

/**
 * Bar component props
 */
export interface BarProps {
  /** Use global store (true) or local props (false). Auto-detected if undefined. */
  global?: boolean;

  // Action mode props
  left?: Act;
  center?: Act;
  main?: Act;
  right?: Act;
  onAction?: (action: string) => void;
  isActive?: boolean;
  /**
   * Optional action context for ActionsProvider-based routing.
   * If omitted, Bar falls back to a minimal default context.
   */
  context?: ActionContext;

  // Mode switching
  mode?: BarMode;

  // Input mode props
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onSubmit?: (text: string) => void;
  inputLeft?: Act;
  inputRight?: Act;
  autoFocus?: boolean;
  onCancel?: () => void;
  /** Whether to show the send button (default: true). Set to false for search mode. */
  showSendButton?: boolean;

  // Sheet mode
  onSheetClose?: () => void;
}

/**
 * Action button props
 */
export interface ActionButtonProps {
  act: Act;
  onPress: () => void;
  position: 'left' | 'center' | 'right';
  animatedStyle?: any;
}

/**
 * Input mode props
 */
export interface InputModeProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  inputLeft?: Act | null;
  onInputLeftPress?: () => void;
  inputRight?: Act | null;
  onInputRightPress?: () => void;
  /** Whether to show the send button (default: true). Set to false for search mode. */
  showSendButton?: boolean;
  onSubmit: (text: string) => void;
  autoFocus?: boolean;
  animatedStyle?: any;
}

/**
 * Sheet content props
 */
export interface SheetContentProps {
  type: SheetType;
  onClose: () => void;
}

/**
 * Backdrop props
 */
export interface BackdropProps {
  visible: boolean;
  onPress: () => void;
}

// Re-export Act from parent types for convenience
import type { Act } from '../types';
