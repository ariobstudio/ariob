/**
 * Bar Types - Extended types for the context-aware bar
 *
 * Re-exports base types from menu/types and adds Bar-specific types.
 */

// Re-export base types
export type { Act, Acts, View, Full, Pick } from '../types';

/**
 * Bar modes
 * - action: Default pill with action buttons
 * - input: Full-width text input
 * - sheet: Expanded nested interface
 */
export type BarMode = 'action' | 'input' | 'sheet';

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
export type BarAction =
  | 'focus' // action → input
  | 'blur' // input → action
  | 'compose' // any → sheet:compose
  | 'ai-config' // any → sheet:ai-config
  | 'account' // any → sheet:account
  | 'degree' // any → sheet:degree
  | 'media' // any → sheet:media
  | 'close'; // sheet → action

/**
 * Bar store state
 */
export interface BarState {
  mode: BarMode;
  sheet: SheetType;
  inputValue: string;
  isAnimating: boolean;
  dispatch: (action: BarAction) => void;
  setInput: (value: string) => void;
  reset: () => void;
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

  // Mode switching
  mode?: 'action' | 'input';

  // Input mode props
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onSubmit?: (text: string) => void;
  inputLeft?: Act;
  autoFocus?: boolean;
  onCancel?: () => void;

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
