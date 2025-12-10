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

const styles = StyleSheet.create((theme) => ({
  line: {
    width: 2,
    flex: 1,
    backgroundColor: theme.colors.borderSubtle,
    opacity: 0.5,
  },
}));
