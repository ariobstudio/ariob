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
          borderColor: '#000',
          shadowColor: color,
        }
      ]} 
    />
  );
};

const styles = StyleSheet.create({
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    marginVertical: -2,
    zIndex: 1,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
  },
});

