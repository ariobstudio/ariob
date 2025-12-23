/** Toast - Main component with composable sub-components */

import { useEffect, useRef, useMemo } from 'react';
import { PanResponder, type GestureResponderEvent, type PanResponderGestureState } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  SlideInUp,
  SlideOutUp,
} from 'react-native-reanimated';

import type { ToastConfig } from './context';
import { toastStyles, type ToastVariant } from './styles';
import * as Parts from './parts';
import { spring } from '../tokens';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const DISMISS_THRESHOLD = 80;
const DEFAULT_TOP_INSET = 60; // Safe default for notched devices

// Cascading stack effect
const STACK_OFFSET = 10; // Fixed offset between stacked toasts (px)
const MAX_VISIBLE_BEHIND = 2; // Only render 2 toasts behind the front one
const SCALE_STEP = 0.03; // Scale reduction per stack level (1.0, 0.97, 0.94...)
const OPACITY_STEP = 0.15; // Opacity reduction per stack level (1.0, 0.85, 0.70...)

// ─────────────────────────────────────────────────────────────────────────────
// Single Toast Item
// ─────────────────────────────────────────────────────────────────────────────

interface ToastItemProps {
  config: ToastConfig;
  index: number;
  total: number;
  heights: Record<string, number>;
  toastIds: string[]; // Ordered list of toast IDs for proper stacking
  topInset?: number;
  onMeasure: (id: string, height: number) => void;
  onDismiss: () => void;
}

export function ToastItem({
  config,
  index,
  total,
  heights,
  toastIds,
  topInset = DEFAULT_TOP_INSET,
  onMeasure,
  onDismiss,
}: ToastItemProps) {
  const translateX = useSharedValue(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reverse index so newest (highest index) appears at top (position 0)
  const reverseIndex = total - 1 - index;

  // Cascading stack: limit visible toasts and calculate stack position
  const stackPosition = Math.min(reverseIndex, MAX_VISIBLE_BEHIND + 1);
  const isHidden = reverseIndex > MAX_VISIBLE_BEHIND;

  // Target values for cascading effect
  const targetOffset = topInset + 36 + (stackPosition * STACK_OFFSET);
  const targetScale = 1 - (stackPosition * SCALE_STEP);
  const targetOpacity = 1 - (stackPosition * OPACITY_STEP);

  // Animated shared values for smooth transitions when stack changes
  const animatedOffset = useSharedValue(targetOffset);
  const animatedScale = useSharedValue(targetScale);
  const animatedOpacity = useSharedValue(targetOpacity);

  // Animate to new positions when stack changes
  useEffect(() => {
    animatedOffset.value = withSpring(targetOffset, spring.smooth);
    animatedScale.value = withSpring(targetScale, spring.smooth);
    animatedOpacity.value = withSpring(targetOpacity, spring.smooth);
  }, [targetOffset, targetScale, targetOpacity]);

  // Auto-dismiss timer (runs even for hidden toasts to maintain queue order)
  useEffect(() => {
    if (config.duration > 0) {
      timerRef.current = setTimeout(onDismiss, config.duration);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [config.duration, onDismiss]);

  // Stable ref for onDismiss to avoid recreating PanResponder
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  // Swipe-to-dismiss using PanResponder (avoids gesture-handler compatibility issues)
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dx) > 5,
        onPanResponderMove: (
          _: GestureResponderEvent,
          gestureState: PanResponderGestureState
        ) => {
          translateX.value = gestureState.dx;
        },
        onPanResponderRelease: (
          _: GestureResponderEvent,
          gestureState: PanResponderGestureState
        ) => {
          if (Math.abs(gestureState.dx) > DISMISS_THRESHOLD) {
            translateX.value = withTiming(
              gestureState.dx > 0 ? 400 : -400,
              { duration: 200 },
              (finished) => {
                if (finished) {
                  runOnJS(onDismissRef.current)();
                }
              }
            );
          } else {
            translateX.value = withSpring(0, spring.snappy);
          }
        },
      }),
    []
  );

  // Animate all stack-related properties for smooth transitions
  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      top: animatedOffset.value,
      transform: [
        { translateX: translateX.value },
        { scale: animatedScale.value },
      ],
      opacity: animatedOpacity.value,
    };
  });

  // Hide toasts beyond the visible limit (they stay in queue with timers running)
  if (isHidden) {
    return null;
  }

  // Handle action press
  const handleAction = () => {
    config.action?.onPress();
    onDismiss();
  };

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        toastStyles.wrapper,
        { zIndex: index + 1 },
        animatedStyle,
      ]}
      entering={SlideInUp.duration(250)}
      exiting={SlideOutUp.duration(150)}
      onLayout={(e) => onMeasure(config.id, e.nativeEvent.layout.height)}
    >
      <Parts.Root variant={config.variant} onDismiss={config.dismissible ? onDismiss : undefined}>
        <Parts.Icon name={config.icon} />
        <Parts.Content>
          <Parts.Label>{config.title}</Parts.Label>
          {config.description && <Parts.Description>{config.description}</Parts.Description>}
        </Parts.Content>
        {config.action && (
          <Parts.Action onPress={handleAction}>{config.action.label}</Parts.Action>
        )}
        {config.dismissible && <Parts.Close />}
      </Parts.Root>
    </Animated.View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Composable Toast Component
// ─────────────────────────────────────────────────────────────────────────────

interface ToastProps {
  children: React.ReactNode;
  variant?: ToastVariant;
  onDismiss?: () => void;
}

/** Composable Toast for JSX usage */
export function Toast({ children, variant = 'default', onDismiss }: ToastProps) {
  return (
    <Parts.Root variant={variant} onDismiss={onDismiss}>
      {children}
    </Parts.Root>
  );
}

// Attach sub-components
Toast.Root = Parts.Root;
Toast.Icon = Parts.Icon;
Toast.Content = Parts.Content;
Toast.Label = Parts.Label;
Toast.Description = Parts.Description;
Toast.Action = Parts.Action;
Toast.Close = Parts.Close;
