import { View, Text } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

export interface PostData {
  content: string;
  image?: string;
  authorAlias?: string; // Optional context
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

const styles = StyleSheet.create((theme) => ({
  container: {
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  content: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    fontWeight: theme.typography.body.fontWeight,
    letterSpacing: theme.typography.body.letterSpacing,
  },
  imageContainer: {
    borderRadius: theme.radii.md, // Soft corners (16px)
    overflow: 'hidden',
    marginTop: theme.spacing.xs,
  },
  imagePlaceholder: {
    width: '100%',
    aspectRatio: 16 / 9,
    // Real implementation would use <Image />
  },
}));
