/**
 * SheetContent - Sheet content router (slot-based)
 *
 * Routes to the appropriate sheet component based on the sheet type.
 * Sheet components are provided via SheetRegistryContext from the app layer.
 * Content auto-sizes based on its natural height.
 */

import { View, Text, Pressable } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Ionicons } from '@expo/vector-icons';
import type { SheetContentProps } from './types';
import { useSheetRegistry } from './SheetRegistry';

export function SheetContent({ type, onClose }: SheetContentProps) {
  const { theme } = useUnistyles();
  const { sheets, titles, selfHeadered } = useSheetRegistry();

  if (!type) return null;

  const SheetComponent = sheets[type];
  const title = titles[type] || type;
  const hasSelfHeader = selfHeadered.has(type);

  // No registered component for this sheet type
  if (!SheetComponent) {
    return (
      <View style={styles.container}>
        <View style={styles.placeholder}>
          <Ionicons name="construct-outline" size={48} color={theme.colors.textMuted} />
          <Text style={styles.placeholderText}>Sheet "{type}" not registered</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header - only for sheets without their own */}
      {!hasSelfHeader && (
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Pressable
            onPress={onClose}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <Ionicons name="close" size={22} color={theme.colors.textMuted} />
          </Pressable>
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        <SheetComponent onClose={onClose} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: theme.radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceMuted,
  },
  content: {
    flex: 1,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  placeholderText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textMuted,
  },
}));
