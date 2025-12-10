import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Profile as ProfileCard, Node, type NodeData } from '@ariob/ripple';
import { useUnistyles } from 'react-native-unistyles';
import { useNode, useCollection } from '@ariob/core';
import { profileScreenStyles as styles } from '../../styles/profile.styles';
import { formatTimestamp } from '../../utils/mockData';

export default function UserProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();

  const isRipple = id === 'Ripple';

  // Fetch user data from Gun graph
  const { data: userData, isLoading, isError } = useNode({
    path: `users/${id}`,
    enabled: !!id && !isRipple,
  });

  // Fetch user's posts
  const { items: userPosts } = useCollection({
    path: `users/${id}/posts`,
    enabled: !!id && !isRipple,
  });

  const displayName = useMemo(() => {
    if (isRipple) return 'Ripple';
    return userData?.alias || (typeof id === 'string' ? id : 'Unknown');
  }, [isRipple, userData, id]);

  const handle = '@' + displayName.replace(/\s+/g, '').toLowerCase();

  const profileData = {
    avatar: displayName[0]?.toUpperCase() || '?',
    handle,
    pubkey: isRipple ? 'System AI Companion' : (userData?.pub || 'Unknown Public Key'),
    mode: 'view' as const,
  };

  // Convert user posts to NodeData
  const posts: NodeData[] = useMemo(() => {
    return userPosts.map((item) => ({
      id: item.id,
      type: 'post' as const,
      author: displayName,
      timestamp: item.data?.created ? formatTimestamp(item.data.created) : 'Unknown',
      degree: item.data?.degree ?? 1,
      content: item.data?.content,
      ...item.data,
    }));
  }, [userPosts, displayName]);

  // Loading state for non-system users
  if (isLoading && !isRipple) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.accentGlow} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.navBar, { paddingTop: insets.top }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={20} color={theme.colors.textPrimary} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.navTitle}>{displayName}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <ProfileCard data={profileData} />

          {isRipple && (
            <View style={styles.keyCard}>
              <Text style={styles.keyLabel}>Status</Text>
              <Text style={styles.keyValue}>Online • AI Mesh Active</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.listItem}>
            <Text style={styles.listLabel}>Mesh Network</Text>
            <Text style={styles.listValue}>Connected</Text>
          </View>
        </View>

        {/* User's Posts */}
        {posts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Posts</Text>
            {posts.map((post, index) => (
              <Node
                key={post.id}
                data={post}
                isLast={index === posts.length - 1}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}



