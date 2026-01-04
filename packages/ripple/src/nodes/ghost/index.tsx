/**
 * Ghost Node
 *
 * Placeholder/loading state node.
 */

import { Text } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

export interface GhostData {
  content: string;
}

interface GhostProps {
  data: GhostData;
}

export const Ghost = ({ data }: GhostProps) => {
  return <Text style={styles.text}>{data.content}</Text>;
};

const styles = StyleSheet.create((theme) => ({
  text: {
    fontStyle: 'italic',
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
  },
}));

// No actions for ghost nodes
export const GHOST_ACTIONS: readonly string[] = [];
