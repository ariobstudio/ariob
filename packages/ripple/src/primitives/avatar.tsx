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
        { width: dim, height: dim, borderRadius: dim / 4 }, // Squircle-ish
        variant === 'companion' && styles.companion,
        variant === 'auth' && styles.auth,
        variant === 'default' && styles.default
      ]}
    >
      {icon ? (
        <Ionicons 
          name={icon as any} 
          size={iconSizeMap[size]} 
          color={variant === 'companion' ? '#FFD700' : '#E7E9EA'} 
        />
      ) : (
        <Text style={[styles.text, { fontSize: fontSizeMap[size] }]}>
          {char?.toUpperCase() || '?'}
        </Text>
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  text: {
    color: '#E7E9EA',
    fontWeight: '700',
  },
  default: {
    backgroundColor: '#1F2226',
  },
  companion: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  auth: {
    backgroundColor: 'rgba(120, 86, 255, 0.1)',
    borderColor: 'rgba(120, 86, 255, 0.3)',
  },
});
