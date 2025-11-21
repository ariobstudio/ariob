/**
 * ContentCard - Clean, card-based content display
 */

import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { type MockPost, formatTimestamp } from '../../utils/mockData';
import { AnimatedPressable } from '../AnimatedPressable';
import { theme } from '../../theme';

interface ContentCardProps {
  post: MockPost;
  index: number;
}

export function ContentCard({ post, index }: ContentCardProps) {
  return (
    <Animated.View entering={FadeInUp.duration(300).delay(index * 50)}>
      <AnimatedPressable scaleDown={0.98}>
        <View style={styles.card}>
          {/* Time and type */}
          <View style={styles.meta}>
            <Text style={styles.time}>{formatTimestamp(post.created)}</Text>
            {post.isDraft && <View style={styles.draftDot} />}
          </View>

          {/* Content */}
          <Text style={styles.content} numberOfLines={4}>
            {post.content}
          </Text>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <View style={styles.tags}>
              {post.tags.slice(0, 2).map((tag, idx) => (
                <Text key={idx} style={styles.tag}>
                  {tag}
                </Text>
              ))}
            </View>
          )}

          {/* Engagement - minimal */}
          {!post.isDraft && (post.reactions || post.replies) && (
            <View style={styles.engagement}>
              {post.reactions && (
                <Text style={styles.engagementText}>{post.reactions} ◐</Text>
              )}
              {post.replies && (
                <Text style={styles.engagementText}>{post.replies} replies</Text>
              )}
            </View>
          )}
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 24,
    marginBottom: 16,
    padding: 20,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${theme.colors.border}20`,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  time: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '500',
  },
  draftDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF9500',
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.text,
    marginBottom: 12,
  },
  tags: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  tag: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    backgroundColor: `${theme.colors.surfaceElevated}60`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  engagement: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  engagementText: {
    fontSize: 13,
    color: theme.colors.textTertiary,
  },
});
