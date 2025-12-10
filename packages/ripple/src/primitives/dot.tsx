import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

interface DotProps {
  color: string;
  type?: 'profile' | 'dm' | 'post' | 'auth' | 'sync' | 'companion';
}

export const Dot = ({ color, type }: DotProps) => {
  return (
    <View
      style={[
        styles.dot,
        {
          backgroundColor: color,
          shadowColor: color,
        }
      ]}
    />
  );
};

const styles = StyleSheet.create((theme) => ({
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: theme.colors.background,
    marginVertical: -2,
    zIndex: 1,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
  },
}));
