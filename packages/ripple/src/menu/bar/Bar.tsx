/**
 * Bar - Stack-based morphing action bar
 *
 * A floating glass capsule that transitions between three modes:
 * - **Action**: Compact pill with action buttons
 * - **Input**: Full-width text input
 * - **Sheet**: Expanded interface for sheets (auto-sizes to content)
 *
 * Stack-based navigation:
 * - Bar maintains a stack of frames
 * - Each frame has its own mode and controls
 * - push/pop/reset for navigation
 *
 * @example
 * ```tsx
 * // Using store (recommended)
 * const bar = useBarStore();
 *
 * // Set base frame actions
 * bar.setActions({
 *   primary: { icon: 'add', onPress: () => bar.openSheet(<MySheet />) }
 * });
 *
 * // Or push a custom frame
 * bar.push({
 *   id: 'compose',
 *   mode: 'sheet',
 *   sheet: { content: <ComposeSheet /> }
 * });
 * ```
 */

import { useEffect, useContext, useCallback, type ReactNode } from 'react';
import { View, Dimensions, Keyboard, type LayoutChangeEvent } from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
  interpolate,
  Easing,
} from 'react-native-reanimated';

import { barStyles } from './bar.styles';
import { Backdrop } from './Backdrop';
import { useBarStore, useCurrentFrame, useCanGoBack } from './store';
import { BarButton, type BarButtonProps } from './Bar.Button';
import { BarActions, type BarActionsProps } from './Bar.Actions';
import { BarInput, type BarInputProps } from './Bar.Input';
import { BarSheet, type BarSheetProps } from './Bar.Sheet';
import type { BarMode, BarFrame, ActionSlot } from '../../protocols/bar';

// Type aliases for cleaner JSX
const AView = Animated.View;
const RView = View;

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const PILL_WIDTH = 180;
const PILL_HEIGHT = 60;
const INPUT_PILL_WIDTH = SCREEN_WIDTH - 32;
const SHEET_WIDTH = SCREEN_WIDTH - 16;
const MIN_SHEET_HEIGHT = 100;
const MAX_SHEET_HEIGHT = SCREEN_HEIGHT - 150;
const DEFAULT_SHEET_HEIGHT = 200;
const DEFAULT_INSETS = { top: 0, bottom: 34, left: 0, right: 0 };

// Fast timing config
const timingConfig = {
  duration: 120,
  easing: Easing.out(Easing.ease),
};

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface BarProps {
  /** Optional children for slot-based API (legacy) */
  children?: ReactNode;
  /** Callback when backdrop/sheet is dismissed */
  onDismiss?: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// ActionSlot Renderer
// ─────────────────────────────────────────────────────────────────────────────

function ActionSlotButton({ slot }: { slot: ActionSlot }) {
  return (
    <BarButton
      icon={slot.icon}
      label={slot.label}
      onPress={slot.onPress}
      disabled={slot.disabled}
    />
  );
}

function FrameActions({ actions }: { actions: BarFrame['actions'] }) {
  if (!actions) return null;

  return (
    <BarActions>
      {actions.leading?.[0] && (
        <BarButton
          key="leading"
          icon={actions.leading[0].icon}
          label={actions.leading[0].label}
          onPress={actions.leading[0].onPress}
          disabled={actions.leading[0].disabled}
          position="left"
        />
      )}
      {actions.primary && (
        <BarButton
          key="primary"
          icon={actions.primary.icon}
          label={actions.primary.label}
          onPress={actions.primary.onPress}
          disabled={actions.primary.disabled}
          position="center"
        />
      )}
      {actions.trailing?.[0] && (
        <BarButton
          key="trailing"
          icon={actions.trailing[0].icon}
          label={actions.trailing[0].label}
          onPress={actions.trailing[0].onPress}
          disabled={actions.trailing[0].disabled}
          position="right"
        />
      )}
    </BarActions>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Bar Component
// ─────────────────────────────────────────────────────────────────────────────

function BarComponent({ children, onDismiss }: BarProps) {
  const safeAreaInsets = useContext(SafeAreaInsetsContext);
  const insets = safeAreaInsets ?? DEFAULT_INSETS;

  // Get current frame from stack
  const frame = useCurrentFrame();
  const canGoBack = useCanGoBack();
  const { pop, reset, inputValue, setInputValue } = useBarStore();

  const mode = frame?.mode ?? 'action';

  // ─────────────────────────────────────────────────────────────────────────
  // Shared Values (UI Thread)
  // ─────────────────────────────────────────────────────────────────────────

  // Sheet content height - measured dynamically
  const sheetContentHeight = useSharedValue(
    typeof frame?.sheet?.height === 'number' ? frame.sheet.height : DEFAULT_SHEET_HEIGHT
  );

  // Animation progress: 0 = action, 1 = expanded
  const progress = useSharedValue(mode === 'action' ? 0 : 1);

  // Target dimensions - animate together with progress
  const targetWidth = useSharedValue(mode === 'sheet' ? SHEET_WIDTH : INPUT_PILL_WIDTH);
  const targetHeight = useSharedValue(
    mode === 'sheet' ? sheetContentHeight.value : PILL_HEIGHT
  );

  // Keyboard offset
  const keyboardHeight = useSharedValue(0);

  // ─────────────────────────────────────────────────────────────────────────
  // Effects (Sync JS state to shared values)
  // ─────────────────────────────────────────────────────────────────────────

  // Update shared values when mode changes
  useEffect(() => {
    const isExpanded = mode !== 'action';
    const newWidth = mode === 'sheet' ? SHEET_WIDTH : INPUT_PILL_WIDTH;
    const newHeight = mode === 'sheet' ? sheetContentHeight.value : PILL_HEIGHT;

    progress.value = withTiming(isExpanded ? 1 : 0, timingConfig);
    targetWidth.value = withTiming(newWidth, timingConfig);
    targetHeight.value = withTiming(newHeight, timingConfig);
  }, [mode]);

  // Handle sheet layout measurement
  const handleSheetLayout = useCallback((event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    if (height > 0) {
      const clampedHeight = Math.min(Math.max(height, MIN_SHEET_HEIGHT), MAX_SHEET_HEIGHT);
      sheetContentHeight.value = clampedHeight;
      if (mode === 'sheet') {
        targetHeight.value = withTiming(clampedHeight, timingConfig);
      }
    }
  }, [mode]);

  // Keyboard handling
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardWillShow', (e) => {
      keyboardHeight.value = withTiming(-e.endCoordinates.height, {
        duration: 250,
        easing: Easing.out(Easing.ease),
      });
    });
    const hideSub = Keyboard.addListener('keyboardWillHide', () => {
      keyboardHeight.value = withTiming(0, {
        duration: 200,
        easing: Easing.out(Easing.ease),
      });
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Animated Styles
  // ─────────────────────────────────────────────────────────────────────────

  const containerStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [{ translateY: keyboardHeight.value }],
    };
  });

  const barStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      width: interpolate(progress.value, [0, 1], [PILL_WIDTH, targetWidth.value]),
      height: interpolate(progress.value, [0, 1], [PILL_HEIGHT, targetHeight.value]),
      borderRadius: interpolate(progress.value, [0, 1], [30, 20]),
    };
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Dismiss Handler
  // ─────────────────────────────────────────────────────────────────────────

  const handleDismiss = useCallback(() => {
    if (frame?.canDismiss !== false) {
      if (canGoBack) {
        pop();
      } else {
        reset();
      }
      onDismiss?.();
    }
  }, [frame, canGoBack, pop, reset, onDismiss]);

  // ─────────────────────────────────────────────────────────────────────────
  // Input Handlers
  // ─────────────────────────────────────────────────────────────────────────

  const handleInputSubmit = useCallback((text: string) => {
    frame?.input?.onSubmit?.(text);
    // Only pop if not persistent (for chat interfaces, keep input open)
    if (canGoBack && !frame?.input?.persistent) {
      pop();
    }
  }, [frame, canGoBack, pop]);

  const handleInputCancel = useCallback(() => {
    frame?.input?.onCancel?.();
    if (canGoBack) pop();
  }, [frame, canGoBack, pop]);

  // ─────────────────────────────────────────────────────────────────────────
  // Render States
  // ─────────────────────────────────────────────────────────────────────────

  const isInputMode = mode === 'input';
  const isSheetMode = mode === 'sheet';
  const isActionMode = mode === 'action';

  // Don't render if no frame
  if (!frame) return null;

  return (
    <>
      {/* Backdrop only for sheet mode */}
      <Backdrop visible={isSheetMode} onPress={handleDismiss} />

      <AView
        style={[barStyles.container, { bottom: insets.bottom + 12 }, containerStyle]}
        pointerEvents="box-none"
      >
        <AView style={[barStyles.shadowWrapper, barStyle]}>
          <RView style={[barStyles.glassContainer, { width: '100%', height: '100%' }]}>
            {/* Action mode - render actions from frame */}
            {isActionMode && frame.actions && (
              <RView style={{ flex: 1 }}>
                <FrameActions actions={frame.actions} />
              </RView>
            )}

            {/* Input mode - render input with frame config */}
            {isInputMode && frame.input && (
              <RView style={{ flex: 1 }}>
                <BarInput
                  value={inputValue}
                  onChangeText={setInputValue}
                  placeholder={frame.input.placeholder}
                  onSubmit={handleInputSubmit}
                  onCancel={handleInputCancel}
                  autoFocus={frame.input.autoFocus}
                  showSendButton={frame.input.showSendButton}
                  leftButton={frame.input.leftAction ? {
                    icon: frame.input.leftAction.icon,
                    onPress: frame.input.leftAction.onPress,
                  } : undefined}
                  rightButton={frame.input.rightAction ? {
                    icon: frame.input.rightAction.icon,
                    onPress: frame.input.rightAction.onPress,
                  } : undefined}
                />
              </RView>
            )}

            {/* Sheet mode - render sheet content from frame */}
            {isSheetMode && frame.sheet?.content && (
              <RView style={{ overflow: 'hidden' }} onLayout={handleSheetLayout}>
                {frame.sheet.content}
              </RView>
            )}
          </RView>
        </AView>
      </AView>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Compound Component Pattern
// ─────────────────────────────────────────────────────────────────────────────

export const Bar = Object.assign(BarComponent, {
  Actions: BarActions,
  Input: BarInput,
  Sheet: BarSheet,
  Button: BarButton,
});

// ─────────────────────────────────────────────────────────────────────────────
// Re-export store and types
// ─────────────────────────────────────────────────────────────────────────────

export {
  useBarStore as useBar,
  useBarMode,
  useBarInputValue,
  useBarVisible,
  useCurrentFrame,
  useCanGoBack,
  useStackDepth,
} from './store';

export type { BarMode, BarFrame, ActionSlot } from './store';

// Re-export slot component types
export type { BarButtonProps } from './Bar.Button';
export type { BarActionsProps } from './Bar.Actions';
export type { BarInputProps } from './Bar.Input';
export type { BarSheetProps } from './Bar.Sheet';
