/**
 * Me Screen - Shows current user's posts
 */

import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useFeed, FeedItemComponent } from '@ariob/ripple';
import { useAuth } from '@ariob/core';
import { theme } from '../theme';
import { TouchableOpacity } from 'react-native-gesture-handler';

export default function MeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, loading } = useFeed({ degree: '0' });

  const renderItem = ({ item }: { item: any }) => {
    return <FeedItemComponent item={item.data} />;
  };

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={theme.colors.text} />
          <Text style={styles.emptyText}>Loading your posts...</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No posts yet</Text>
        <Text style={styles.emptyText}>
          You haven't created any posts yet.{'\n'}
          Tap the + button to create your first post!
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Me</Text>
          <TouchableOpacity onPress={() => router.push('/settings')}>
            <Text style={styles.settingsButton}>⚙</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Info */}
        {user && (
          <View style={styles.profileSection}>
            <Text style={styles.userName}>{user.alias || 'Anonymous'}</Text>
            <Text style={styles.postCount}>{items.length} posts</Text>
          </View>
        )}

        {/* Feed */}
        <FlashList
          data={items}
          renderItem={renderItem}
          estimatedItemSize={200}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.feedContent}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    fontSize: 28,
    color: theme.colors.text,
  },
  settingsButton: {
    fontSize: 24,
    color: theme.colors.text,
  },
  title: {
    ...theme.typography.heading,
    color: theme.colors.text,
  },
  profileSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    alignItems: 'center',
  },
  userName: {
    ...theme.typography.title,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  postCount: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  feedContent: {
    paddingVertical: theme.spacing.md,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    minHeight: 400,
  },
  emptyTitle: {
    ...theme.typography.heading,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
