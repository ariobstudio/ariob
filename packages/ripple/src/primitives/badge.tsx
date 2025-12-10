import { View, Text } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

interface BadgeProps {
  label: string;
  variant?: 'dm' | 'ai' | 'new' | 'default';
}

export const Badge = ({ label, variant = 'default' }: BadgeProps) => {
  return (
    <View style={[styles.badge, styles[`${variant}Badge`]]}>
      <Text style={[styles.text, styles[`${variant}Text`]]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  badge: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
  },
  text: {
    fontSize: 9,
    fontWeight: 'bold' as const,
  },
  dmBadge: {
    backgroundColor: `${theme.colors.indicator.message}15`,
    borderColor: `${theme.colors.indicator.message}30`,
  },
  dmText: {
    color: theme.colors.indicator.message,
  },
  aiBadge: {
    backgroundColor: `${theme.colors.indicator.ai}15`,
    borderColor: `${theme.colors.indicator.ai}30`,
  },
  aiText: {
    color: theme.colors.indicator.ai,
  },
  newBadge: {
    backgroundColor: `${theme.colors.indicator.auth}15`,
    borderColor: `${theme.colors.indicator.auth}30`,
  },
  newText: {
    color: theme.colors.indicator.auth,
  },
  defaultBadge: {
    backgroundColor: `${theme.colors.text}15`,
    borderColor: `${theme.colors.text}20`,
  },
  defaultText: {
    color: theme.colors.text,
  },
}));
