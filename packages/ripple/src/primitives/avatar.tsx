import { View, Text, Pressable } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { Ionicons } from '@expo/vector-icons';

export interface AvatarProps {
  char?: string;
  icon?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'companion' | 'auth';
  onPress?: () => void;
}

export const Avatar = ({ char, icon, size = 'medium', variant = 'default', onPress }: AvatarProps) => {
  const sizeMap = {
    small: 24,
    medium: 32,
    large: 64,
  };

  const fontSizeMap = {
    small: 10,
    medium: 14,
    large: 28,
  };

  const iconSizeMap = {
    small: 14,
    medium: 18,
    large: 32,
  };

  const dim = sizeMap[size];

  const Container = onPress ? Pressable : View;

  return (
    <Container
      onPress={onPress}
      style={[
        styles.container,
        { width: dim, height: dim, borderRadius: dim / 4 },
        variant === 'companion' && styles.companion,
        variant === 'auth' && styles.auth,
        variant === 'default' && styles.default
      ]}
    >
      {icon ? (
        <Ionicons
          name={icon as any}
          size={iconSizeMap[size]}
          style={[
            styles.icon,
            variant === 'companion' && styles.companionIcon,
          ]}
        />
      ) : (
        <Text style={[styles.text, { fontSize: fontSizeMap[size] }]}>
          {char?.toUpperCase() || '?'}
        </Text>
      )}
    </Container>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  text: {
    color: theme.colors.text,
    fontWeight: '700',
  },
  icon: {
    color: theme.colors.text,
  },
  companionIcon: {
    color: theme.colors.indicator.ai,
  },
  default: {
    backgroundColor: theme.colors.surfaceMuted,
  },
  companion: {
    backgroundColor: `${theme.colors.indicator.ai}15`,
    borderColor: `${theme.colors.indicator.ai}30`,
  },
  auth: {
    backgroundColor: `${theme.colors.indicator.auth}15`,
    borderColor: `${theme.colors.indicator.auth}30`,
  },
}));
