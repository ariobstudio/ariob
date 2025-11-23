import { View, Text, Pressable } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

export interface SuggestionData {
  content: string;
}

interface SuggestionProps {
  data: SuggestionData;
}

export const Suggestion = ({ data }: SuggestionProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.content}>{data.content}</Text>
      <Pressable style={styles.button}>
        <Text style={styles.buttonText}>Connect Node</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  content: {
    color: '#E7E9EA',
    fontSize: 15,
  },
  button: {
    width: '100%',
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(120, 86, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(120, 86, 255, 0.3)',
    alignItems: 'center' as const,
  },
  buttonText: {
    color: '#7856FF',
    fontSize: 12,
    fontWeight: 'bold' as const,
  },
});
