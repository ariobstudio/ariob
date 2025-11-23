import { Text } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

export interface GhostData {
  content: string;
}

interface GhostProps {
  data: GhostData;
}

export const Ghost = ({ data }: GhostProps) => {
  return (
    <Text style={styles.text}>{data.content}</Text>
  );
};

const styles = StyleSheet.create({
  text: {
    fontStyle: 'italic' as const,
    color: '#71767B',
    fontSize: 15,
  },
});
