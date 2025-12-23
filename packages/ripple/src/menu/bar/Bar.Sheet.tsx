/**
 * Bar.Sheet - Sheet slot component
 *
 * Container for sheet content. Sizes to content by default.
 * Used as a slot inside Bar when mode === 'sheet'.
 */

import type { ReactNode } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';

export interface BarSheetProps {
  /** Sheet content to render */
  children: ReactNode;
  /** Enable scrolling for long content (default: false - sizes to content) */
  scrollable?: boolean;
}

export function BarSheet({ children, scrollable = false }: BarSheetProps) {
  if (scrollable) {
    return (
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    );
  }

  // Default: size to content
  return <View style={styles.container}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    // No flex: 1 - let content determine height
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});

// Mark as slot for Bar to identify
BarSheet.displayName = 'Bar.Sheet';
BarSheet.__isBarSlot = 'sheet';
