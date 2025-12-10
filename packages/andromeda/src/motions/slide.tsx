/**
 * Slide - Slide animation components
 *
 * Components for sliding content in/out from screen edges.
 * Uses spring physics for natural, bouncy motion.
 *
 * @example
 * ```tsx
 * // Controlled slide from bottom
 * <Slide show={isOpen} from="bottom">
 *   <BottomSheet>Content</BottomSheet>
 * </Slide>
 *
 * // Slide from top
 * <Slide show={hasNotification} from="top">
 *   <Toast message="New message!" />
 * </Slide>
 *
 * // Mount-based: SlideUp (enters from bottom, exits to bottom)
 * {showModal && (
 *   <SlideUp>
 *     <Modal>...</Modal>
 *   </SlideUp>
 * )}
 *
 * // Mount-based: SlideDown (enters from top, exits to top)
 * {showDropdown && (
 *   <SlideDown>
 *     <Dropdown>...</Dropdown>
 *   </SlideDown>
 * )}
 * ```
 *
 * @see Fade - For opacity-only animations
 */

import Animated, {
  useAnimatedStyle,
  withSpring,
  SlideInDown,
  SlideInUp,
  SlideOutDown,
  SlideOutUp,
} from 'react-native-reanimated';
import type { ReactNode } from 'react';
import type { ViewStyle } from 'react-native';

/**
 * Props for the Slide component
 */
export interface SlideProps {
  /** Content to animate */
  children: ReactNode;
  /** Slide direction */
  from?: 'top' | 'bottom';
  /** Controls visibility */
  show?: boolean;
  /** Distance to slide in pixels */
  offset?: number;
  /** Additional styles */
  style?: ViewStyle;
}

/**
 * Slides content from direction based on show prop.
 */
export function Slide({ children, from = 'bottom', show = true, offset = 100, style }: SlideProps) {
  const anim = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: withSpring(show ? 0 : from === 'bottom' ? offset : -offset, {
          damping: 16,
          stiffness: 180,
        }),
      },
    ],
    opacity: withSpring(show ? 1 : 0),
  }));

  return (
    <Animated.View style={[anim, style]}>
      {children}
    </Animated.View>
  );
}

/** Slide in from bottom on mount. */
export function SlideUp({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return (
    <Animated.View entering={SlideInDown} exiting={SlideOutDown} style={style}>
      {children}
    </Animated.View>
  );
}

/** Slide in from top on mount. */
export function SlideDown({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return (
    <Animated.View entering={SlideInUp} exiting={SlideOutUp} style={style}>
      {children}
    </Animated.View>
  );
}
