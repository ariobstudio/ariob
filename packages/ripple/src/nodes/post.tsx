import { View, Text } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

export interface PostData {
  content: string;
  image?: string;
}

interface PostProps {
  data: PostData;
}

export const Post = ({ data }: PostProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.content}>{data.content}</Text>
      {data.image && (
        <View style={styles.imageContainer}>
          <View style={styles.imagePlaceholder} />
        </View>
      )}
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
    lineHeight: 20,
  },
  imageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2F3336',
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#1F2226',
  },
});

