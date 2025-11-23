import { View, Pressable } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import type { ReactNode } from 'react';

interface ShellProps {
  children: ReactNode;
  onPress?: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  variant?: 'default' | 'ghost';
  style?: any;
}

export const Shell = ({ children, onPress, onPressIn, onPressOut, variant = 'default', style }: ShellProps) => {
  const Container = onPress ? Pressable : View;
  
  return (
    <Container 
      style={[
        styles.shell,
        variant === 'ghost' && styles.ghost,
        style
      ]}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
    >
      {children}
    </Container>
  );
};

const styles = StyleSheet.create({
  shell: {
    backgroundColor: 'rgba(22, 24, 28, 0.6)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderStyle: 'dashed' as const,
    borderColor: 'rgba(255,255,255,0.1)',
    opacity: 0.6,
    shadowOpacity: 0,
    elevation: 0,
  },
});
