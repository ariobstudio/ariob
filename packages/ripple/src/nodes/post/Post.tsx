import { View, Text } from 'react-native';
import { useUnistyles } from 'react-native-unistyles';
import { postStyles as styles } from './post.styles';

export interface PostData {
  id?: string;
  content: string;
  image?: string;
  images?: string[];
  authorAlias?: string;
  degree?: number;
}

interface PostProps {
  data: PostData;
}

/**
 * Post Node - Clean, text-forward design
 *
 * Removed heavy borders. Uses whitespace and typography hierarchy.
 */
export const Post = ({ data }: PostProps) => {
  const { theme } = useUnistyles();

  return (
    <View style={styles.container}>
      <Text style={styles.content}>{data.content}</Text>

      {data.image && (
        <View style={styles.imageContainer}>
          <View style={[styles.imagePlaceholder, { backgroundColor: theme.colors.surfaceMuted }]} />
        </View>
      )}
    </View>
  );
};
