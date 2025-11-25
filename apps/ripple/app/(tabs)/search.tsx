/**
 * Search Screen
 *
 * Search for people, posts, and content across degrees.
 */

// CRITICAL: Import Unistyles configuration first
import '../../unistyles.config';

import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
} from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { mockProfiles, mockPosts, formatTimestamp, type MockPost, type MockProfile } from '../../utils/mockData';

type SearchTab = 'all' | 'people' | 'posts';

const stylesheet = StyleSheet.create((theme) => ({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.text,
    letterSpacing: -0.5,
    marginBottom: theme.spacing.lg,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  searchIcon: {
    fontSize: 18,
    color: theme.colors.textTertiary,
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    paddingVertical: theme.spacing.md,
  },
  placeholder: {
    color: theme.colors.textTertiary,
  },
  clearButton: {
    padding: theme.spacing.sm,
  },
  clearIcon: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  tabs: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  tabButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.surface,
  },
  tabButtonActive: {
    backgroundColor: theme.colors.text,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  tabButtonTextActive: {
    color: theme.colors.background,
  },
  results: {
    paddingBottom: 120,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl * 2,
    paddingHorizontal: theme.spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    color: theme.colors.textTertiary,
    marginBottom: theme.spacing.lg,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  emptySubtext: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  personCard: {
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  personAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  personAvatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.background,
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  personBio: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  connectButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radii.sm,
  },
  connectButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
  },
  postCard: {
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  postAuthor: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },
  postTime: {
    fontSize: 12,
    color: theme.colors.textTertiary,
  },
  postContent: {
    fontSize: 16,
    lineHeight: 22,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  postTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  postTag: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
}));

export default function SearchScreen() {
  const { theme } = useUnistyles();
  const styles = stylesheet;
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SearchTab>('all');

  // Simple search filtering
  const filteredPeople = mockProfiles.filter(p =>
    p.alias.toLowerCase().includes(query.toLowerCase()) ||
    p.bio?.toLowerCase().includes(query.toLowerCase())
  );

  const filteredPosts = mockPosts.filter(p =>
    p.content.toLowerCase().includes(query.toLowerCase()) ||
    p.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
  );

  const showPeople = activeTab === 'all' || activeTab === 'people';
  const showPosts = activeTab === 'all' || activeTab === 'posts';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Search</Text>

          {/* Search Input */}
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>◎</Text>
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="Search people, posts, tags..."
              placeholderTextColor={styles.placeholder.color}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {query.length > 0 && (
              <Pressable onPress={() => setQuery('')} style={styles.clearButton}>
                <Text style={styles.clearIcon}>✕</Text>
              </Pressable>
            )}
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            <TabButton label="All" active={activeTab === 'all'} onPress={() => setActiveTab('all')} />
            <TabButton label="People" active={activeTab === 'people'} onPress={() => setActiveTab('people')} />
            <TabButton label="Posts" active={activeTab === 'posts'} onPress={() => setActiveTab('posts')} />
          </View>
        </View>

        {/* Results */}
        {query.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>◎</Text>
            <Text style={styles.emptyText}>Start typing to search</Text>
            <Text style={styles.emptySubtext}>
              Find people, posts, and conversations
            </Text>
          </View>
        ) : (
          <FlatList
            data={[
              ...(showPeople ? filteredPeople.map(p => ({ type: 'person' as const, data: p })) : []),
              ...(showPosts ? filteredPosts.filter(p => !p.isDraft).map(p => ({ type: 'post' as const, data: p })) : []),
            ]}
            keyExtractor={(item) =>
              item.type === 'person' ? item.data.pub : item.data.id
            }
            renderItem={({ item }) =>
              item.type === 'person' ? (
                <PersonCard person={item.data} />
              ) : (
                <PostCard post={item.data} />
              )
            }
            contentContainerStyle={styles.results}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No results found</Text>
                <Text style={styles.emptySubtext}>
                  Try a different search term
                </Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const { theme } = useUnistyles();
  const styles = stylesheet;
  return (
    <Pressable
      onPress={onPress}
      style={[styles.tabButton, active && styles.tabButtonActive]}
    >
      <Text style={[styles.tabButtonText, active && styles.tabButtonTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

function PersonCard({ person }: { person: MockProfile }) {
  const { theme } = useUnistyles();
  const styles = stylesheet;
  return (
    <Pressable style={styles.personCard}>
      <View style={styles.personAvatar}>
        <Text style={styles.personAvatarText}>
          {person.alias.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.personInfo}>
        <Text style={styles.personName}>{person.alias}</Text>
        {person.bio && (
          <Text style={styles.personBio} numberOfLines={2}>
            {person.bio}
          </Text>
        )}
      </View>
      <Pressable style={styles.connectButton}>
        <Text style={styles.connectButtonText}>Connect</Text>
      </Pressable>
    </Pressable>
  );
}

function PostCard({ post }: { post: MockPost }) {
  const { theme } = useUnistyles();
  const styles = stylesheet;
  return (
    <Pressable style={styles.postCard}>
      <View style={styles.postHeader}>
        <Text style={styles.postAuthor}>{post.authorAlias}</Text>
        <Text style={styles.postTime}>{formatTimestamp(post.created)}</Text>
      </View>
      <Text style={styles.postContent} numberOfLines={4}>
        {post.content}
      </Text>
      {post.tags && post.tags.length > 0 && (
        <View style={styles.postTags}>
          {post.tags.map((tag, idx) => (
            <Text key={idx} style={styles.postTag}>
              #{tag}
            </Text>
          ))}
        </View>
      )}
    </Pressable>
  );
}
