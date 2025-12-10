/**
 * Scroll - Scrollable container
 *
 * A ScrollView wrapper with sensible defaults and optional snap behavior.
 *
 * @example
 * ```tsx
 * <Scroll>
 *   <Stack gap="md">
 *     {items.map(item => <Card key={item.id} {...item} />)}
 *   </Stack>
 * </Scroll>
 *
 * <Scroll horizontal snap>
 *   {slides.map(slide => <OnboardingSlide key={slide.id} {...slide} />)}
 * </Scroll>
 * ```
 *
 * @note Scrollbars are hidden by default
 */

import { ScrollView, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';

/**
 * Props for the Scroll layout component
 */
export interface ScrollProps {
  /** Scrollable content */
  children: ReactNode;
  /** Enable horizontal scrolling */
  horizontal?: boolean;
  /** Enable paging/snap behavior */
  snap?: boolean;
  /** Styles for the scroll container */
  style?: ViewStyle;
  /** Styles for the content container */
  contentStyle?: ViewStyle;
}

/**
 * Scroll - scrollable container with snap support.
 */
export function Scroll({
  children,
  horizontal,
  snap,
  style,
  contentStyle,
}: ScrollProps) {
  return (
    <ScrollView
      horizontal={horizontal}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      pagingEnabled={snap}
      style={[styles.scroll, style]}
      contentContainerStyle={contentStyle}
    >
      {children}
    </ScrollView>
  );
}

const styles = {
  scroll: {
    flex: 1,
  } as ViewStyle,
};
