/**
 * Suggestion Node
 *
 * Displays connection suggestions.
 */

import { View, Text, Pressable } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

export interface SuggestionData {
  content: string;
}

interface SuggestionProps {
  data: SuggestionData;
}

export const Suggestion = ({ data }: SuggestionProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.content}>{data.content}</Text>
      <Pressable style={styles.button}>
        <Text style={styles.buttonText}>Connect Node</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    gap: theme.spacing.sm,
  },
  content: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body.fontSize,
  },
  button: {
    width: '100%',
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.accentSoft,
    borderWidth: 1,
    borderColor: theme.colors.accent,
    alignItems: 'center',
  },
  buttonText: {
    color: theme.colors.accent,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: 'bold',
  },
}));

// No registered actions for suggestion nodes
export const SUGGESTION_ACTIONS: readonly string[] = [];
