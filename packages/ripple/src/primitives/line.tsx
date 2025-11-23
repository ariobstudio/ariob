import { View, type ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

interface LineProps {
  visible?: boolean;
  style?: ViewStyle;
}

export const Line = ({ visible = true, style }: LineProps) => {
  if (!visible) return null;
  
  return <View style={[styles.line, style]} />;
};

const styles = StyleSheet.create({
  line: {
    width: 2,
    flex: 1,
    backgroundColor: '#222',
    opacity: 0.5,
  },
});

