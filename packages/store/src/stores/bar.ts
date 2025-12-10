/**
 * Bar Store - State machine for the context-aware bottom bar
 *
 * Manages the bar's mode transitions and sheet content.
 * The bar can be in action, input, or sheet mode.
 *
 * State Machine:
 * ```
 * action ←→ input
 *    ↕
 *  sheet
 * ```
 *
 * @example
 * ```tsx
 * import { useBarStore } from '@ariob/store/stores';
 *
 * function Bar() {
 *   const { mode, sheet, dispatch } = useBarStore();
 *
 *   if (mode === 'sheet') {
 *     return <SheetContent type={sheet} />;
 *   }
 *
 *   return (
 *     <View>
 *       {mode === 'input' ? <Input /> : <ActionButtons />}
 *       <Button onPress={() => dispatch('compose')}>Create</Button>
 *     </View>
 *   );
 * }
 * ```
 */

import { define } from '../create';

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
 * Bar store state and actions
 */
export interface BarState {
  /** Current bar mode */
  mode: BarMode;
  /** Active sheet type (when mode === 'sheet') */
  sheet: SheetType;
  /** Input value (when mode === 'input') */
  inputValue: string;
  /** Whether bar is animating */
  isAnimating: boolean;

  // Actions
  /** Dispatch action to transition state */
  dispatch: (action: BarAction) => void;
  /** Set input value */
  setInput: (value: string) => void;
  /** Reset to initial state */
  reset: () => void;
}

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

const initialState = {
  mode: 'action' as BarMode,
  sheet: null as SheetType,
  inputValue: '',
  isAnimating: false,
};

/**
 * State machine reducer
 */
function reducer(state: BarState, action: BarAction): Partial<BarState> {
  switch (action) {
    case 'focus':
      return { mode: 'input', sheet: null };

    case 'blur':
      return { mode: 'action', sheet: null };

    case 'compose':
      return { mode: 'sheet', sheet: 'compose' };

    case 'ai-config':
      return { mode: 'sheet', sheet: 'ai-config' };

    case 'account':
      return { mode: 'sheet', sheet: 'account' };

    case 'degree':
      return { mode: 'sheet', sheet: 'degree' };

    case 'media':
      return { mode: 'sheet', sheet: 'media' };

    case 'close':
      return { mode: 'action', sheet: null, inputValue: '' };

    default:
      return {};
  }
}

/**
 * Bar store hook (non-persisted - UI state)
 */
export const useBarStore = define<BarState>((set, get) => ({
  ...initialState,

  dispatch: (action) => {
    const updates = reducer(get(), action);
    set({ isAnimating: true, ...updates });
    // Clear animation flag after transition
    setTimeout(() => set({ isAnimating: false }), 300);
  },

  setInput: (inputValue) => set({ inputValue }),

  reset: () => set(initialState),
}));
