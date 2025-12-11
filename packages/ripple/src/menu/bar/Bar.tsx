/**
 * Bar - Context-aware floating action bar with morphing animation
 *
 * A sleek floating glass capsule that transitions between three modes:
 * - **Action**: Compact pill with action buttons
 * - **Input**: Full-width text input for replies/messages
 * - **Sheet**: Expanded interface for compose, AI config, etc.
 */

import { useEffect, useCallback } from 'react';
import {
  View,
  Dimensions,
  Platform,
} from 'react-native';
import { create } from 'zustand';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  interpolate,
} from 'react-native-reanimated';
import { useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';

import type { BarProps, Act, SheetType } from './types';
import { ActionButton } from './ActionButtons';
import { InputMode } from './InputMode';
import { SheetContent } from './SheetContent';
import { Backdrop } from './Backdrop';
import { rippleSprings } from '../../styles/tokens';
import { barStyles } from './bar.styles';
import { useActionsConfigSafe, useActionHandler } from '../provider';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PILL_WIDTH = 180; // Slightly wider for comfort
const PILL_HEIGHT = 60; // Taller for modern touch targets
const INPUT_PILL_WIDTH = SCREEN_WIDTH - 32;
const SHEET_WIDTH = SCREEN_WIDTH - 16;
const SHEET_HEIGHT = 280; // Height for sheet content

const springConfig = rippleSprings.smooth;

// ─────────────────────────────────────────────────────────────────────────────
// Legacy Store (for backward compatibility)
// ─────────────────────────────────────────────────────────────────────────────

interface BarState {
  mode: 'action' | 'input' | 'sheet';
  sheet: SheetType;
  left: Act | null;
  center: Act | null;
  right: Act | null;
  inputLeft: Act | null;
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

interface BarActions {
  setMode: (mode: 'action' | 'input' | 'sheet') => void;
  setActions: (acts: { left?: Act | null; center?: Act | null; right?: Act | null }) => void;
  setInputLeft: (act: Act | null) => void;
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

const initialState: BarState = {
  mode: 'action',
  sheet: null,
  left: null,
  center: null,
  right: null,
  inputLeft: null,
  placeholder: 'Message...',
  value: '',
  autoFocus: true,
  visible: true,
  isActive: false,
  persistInputMode: false,
  onAction: null,
  onSubmit: null,
  onCancel: null,
};

export const useBar = create<BarState & BarActions>((set) => ({
  ...initialState,
  setMode: (mode) => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    set({ mode });
  },
  setActions: ({ left, center, right }) =>
    set((s) => ({
      left: left !== undefined ? left : s.left,
      center: center !== undefined ? center : s.center,
      right: right !== undefined ? right : s.right,
    })),
  setInputLeft: (inputLeft) => set({ inputLeft }),
  setValue: (value) => set({ value }),
  setPlaceholder: (placeholder) => set({ placeholder }),
  show: () => set({ visible: true }),
  hide: () => set({ visible: false }),
  setActive: (isActive) => set({ isActive }),
  setCallbacks: ({ onAction, onSubmit, onCancel }) =>
    set((s) => ({
      onAction: onAction !== undefined ? onAction : s.onAction,
      onSubmit: onSubmit !== undefined ? onSubmit : s.onSubmit,
      onCancel: onCancel !== undefined ? onCancel : s.onCancel,
    })),
  configure: (config) => set((s) => ({ ...s, ...config })),
  reset: () => set(initialState),
  openSheet: (type) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    set({ mode: 'sheet', sheet: type });
  },
  closeSheet: () => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    set({ mode: 'action', sheet: null });
  },
}));

// Selector hooks
export const useBarMode = () => useBar((s) => s.mode);
export const useBarVisible = () => useBar((s) => s.visible);

// ─────────────────────────────────────────────────────────────────────────────
// Main Bar Component
// ─────────────────────────────────────────────────────────────────────────────

export function Bar(props: BarProps) {
  const store = useBar();
  const insets = useSafeAreaInsets();
  const { height: keyboardHeight } = useReanimatedKeyboardAnimation();

  // Get context-based action handling if available
  const actionsConfig = useActionsConfigSafe();
  const contextActionHandler = useActionHandler();

  // Determine if using global store or local props
  const useGlobal = props.global === true ||
    (props.global !== false && !props.mode && !props.center && !props.main);

  // Resolve values from store or props
  const mode = useGlobal ? store.mode : (props.mode ?? 'action');
  const left = useGlobal ? store.left : props.left;
  const center = useGlobal ? store.center : (props.center ?? props.main);
  const right = useGlobal ? store.right : props.right;
  const inputLeft = useGlobal ? store.inputLeft : props.inputLeft;
  const placeholder = useGlobal ? store.placeholder : (props.placeholder ?? 'Message...');
  const value = useGlobal ? store.value : (props.value ?? '');
  const autoFocus = useGlobal ? store.autoFocus : (props.autoFocus ?? true);
  const sheet = useGlobal ? store.sheet : null;

  // Callbacks
  const onAction = useCallback(
    (actionName: string) => {
      if (actionsConfig) {
        contextActionHandler(actionName, { view: { degree: 0, profile: false } });
        return;
      }
      if (useGlobal && store.onAction) {
        store.onAction(actionName);
      } else if (props.onAction) {
        props.onAction(actionName);
      }
    },
    [actionsConfig, contextActionHandler, useGlobal, store.onAction, props.onAction]
  );
  const onSubmit = useGlobal ? store.onSubmit : props.onSubmit;
  const onCancel = useGlobal ? store.onCancel : props.onCancel;
  const onChangeText = useGlobal ? store.setValue : props.onChangeText;

  if (useGlobal && !store.visible) return null;

  // Unified animation: 0 = action, 1 = expanded
  const progress = useSharedValue(mode === 'action' ? 0 : 1);

  const isInputMode = mode === 'input';
  const isSheetMode = mode === 'sheet';
  const isExpanded = isInputMode || isSheetMode;

  useEffect(() => {
    progress.value = withSpring(isExpanded ? 1 : 0, springConfig);
  }, [mode, isExpanded]);

  // Animated Styles - all use 'worklet' directive for UI thread execution
  const containerStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [{ translateY: keyboardHeight.value }],
    };
  });

  const barStyle = useAnimatedStyle(() => {
    'worklet';
    const targetWidth = isSheetMode ? SHEET_WIDTH : INPUT_PILL_WIDTH;
    const targetHeight = isSheetMode ? SHEET_HEIGHT : PILL_HEIGHT;

    return {
      width: interpolate(progress.value, [0, 1], [PILL_WIDTH, targetWidth]),
      height: interpolate(progress.value, [0, 1], [PILL_HEIGHT, targetHeight]),
      borderRadius: interpolate(progress.value, [0, 1], [30, 24]),
    };
  });

  const actionButtonsStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      opacity: interpolate(progress.value, [0, 0.2], [1, 0]),
      transform: [{ scale: interpolate(progress.value, [0, 0.2], [1, 0.8]) }],
    };
  });

  // FIXED: Use interpolate instead of ternary for flex to prevent layout thrashing
  const contentStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      opacity: interpolate(progress.value, [0.3, 0.8], [0, 1]),
      flex: interpolate(progress.value, [0, 0.2, 1], [0, 1, 1]),
      transform: [{ scale: interpolate(progress.value, [0.3, 1], [0.95, 1]) }],
    };
  });

  // Handlers
  const handleAction = (act: Act) => {
    onAction(act.name);
  };

  const handleDismiss = () => {
    if (useGlobal) {
      if (isSheetMode) {
        store.closeSheet();
      } else if (!store.persistInputMode) {
        store.setMode('action');
        store.setValue('');
      }
    }
    onCancel?.();
    props.onSheetClose?.();
  };

  const handleInputLeft = () => {
    if (inputLeft) {
      onAction(inputLeft.name);
    }
  };

  const handleSubmit = (text: string) => {
    onSubmit?.(text);
    if (useGlobal) {
      store.setValue('');
    }
  };

  if (!center && !isInputMode && !isSheetMode) return null;

  // Render glass container
  return (
    <>
      <Backdrop
        visible={isExpanded && !(useGlobal && store.persistInputMode && isInputMode)}
        onPress={handleDismiss}
      />

      <Animated.View
        style={[barStyles.container, { bottom: insets.bottom + 12 }, containerStyle]}
        pointerEvents="box-none"
      >
        <Animated.View style={[barStyles.shadowWrapper, barStyle]}>
          <View style={[barStyles.glassContainer, { width: '100%', height: '100%' }]}>
            {!isExpanded && (
              <View style={barStyles.actionRow}>
                <View style={barStyles.side}>
                  {left ? (
                    <ActionButton
                      act={left}
                      onPress={() => handleAction(left)}
                      position="left"
                      animatedStyle={actionButtonsStyle}
                    />
                  ) : null}
                </View>

                {center ? (
                  <ActionButton
                    act={center}
                    onPress={() => handleAction(center)}
                    position="center"
                    animatedStyle={actionButtonsStyle}
                  />
                ) : null}

                <View style={barStyles.side}>
                  {right ? (
                    <ActionButton
                      act={right}
                      onPress={() => handleAction(right)}
                      position="right"
                      animatedStyle={actionButtonsStyle}
                    />
                  ) : null}
                </View>
              </View>
            )}

            {isInputMode && (
              <InputMode
                value={value}
                onChangeText={onChangeText ?? (() => {})}
                placeholder={placeholder}
                inputLeft={inputLeft}
                onInputLeftPress={handleInputLeft}
                onSubmit={handleSubmit}
                autoFocus={autoFocus}
                animatedStyle={contentStyle}
              />
            )}

            {isSheetMode && sheet && (
              <Animated.View style={[{ overflow: 'hidden' }, contentStyle]}>
                <SheetContent type={sheet} onClose={handleDismiss} />
              </Animated.View>
            )}
          </View>
        </Animated.View>
      </Animated.View>
    </>
  );
}

export type ActionType = string;
