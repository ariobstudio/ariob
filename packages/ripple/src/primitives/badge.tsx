import { View, Text } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

interface BadgeProps {
  label: string;
  variant?: 'dm' | 'ai' | 'new' | 'default';
}

export const Badge = ({ label, variant = 'default' }: BadgeProps) => {
  const variantStyles = {
    dm: styles.dmBadge,
    ai: styles.aiBadge,
    new: styles.newBadge,
    default: styles.defaultBadge,
  };
  
  const textVariants = {
    dm: styles.dmText,
    ai: styles.aiText,
    new: styles.newText,
    default: styles.defaultText,
  };
  
  return (
    <View style={[styles.badge, variantStyles[variant]]}>
      <Text style={[styles.text, textVariants[variant]]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
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
    backgroundColor: 'rgba(29, 155, 240, 0.1)',
    borderColor: 'rgba(29, 155, 240, 0.2)',
  },
  dmText: {
    color: '#1D9BF0',
  },
  aiBadge: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderColor: 'rgba(255, 215, 0, 0.2)',
  },
  aiText: {
    color: '#FFD700',
  },
  newBadge: {
    backgroundColor: 'rgba(120, 86, 255, 0.1)',
    borderColor: 'rgba(120, 86, 255, 0.2)',
  },
  newText: {
    color: '#7856FF',
  },
  defaultBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  defaultText: {
    color: '#E7E9EA',
  },
});

