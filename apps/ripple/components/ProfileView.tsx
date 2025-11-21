/**
 * ProfileView - Refined profile view for degree 0
 * Editorial minimalism: your personal space
 */

import { useState } from 'react';
import { View, FlatList, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { getDrafts, getUserPosts, mockProfiles, type MockPost } from '../utils/mockData';
import { ProfileHeader } from './profile/ProfileHeader';
import { StatsBar } from './profile/StatsBar';
import { SectionTabs } from './profile/SectionTabs';
import { ContentCard } from './profile/ContentCard';

type Section = 'all' | 'drafts';

const stylesheet = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingBottom: 120, // Space for tab bar
  },
  empty: {
    paddingVertical: 64,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: theme.colors.textTertiary,
  },
}));

export function ProfileView() {
  const router = useRouter();
  const { theme } = useUnistyles();
  const styles = stylesheet;
  const [section, setSection] = useState<Section>('all');

  const user = mockProfiles.find(p => p.pub === 'user-current')!;
  const drafts = getDrafts();
  const posts = getUserPosts();
  const allContent = [...posts, ...drafts].sort((a, b) => b.created - a.created);

  // Filter content based on section
  const content = section === 'drafts' ? drafts : allContent;

  const renderEmpty = () => (
    <View style={styles.empty}>
      <Text style={styles.emptyText}>
        {section === 'drafts' ? 'No drafts yet' : 'Nothing here yet'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <FlatList
        data={content}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => <ContentCard post={item} index={index} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <ProfileHeader
              alias={user.alias}
              bio={user.bio}
              onSettingsPress={() => router.push('/settings')}
            />
            <StatsBar
              posts={posts.length}
              drafts={drafts.length}
              connections={24}
            />
            <SectionTabs
              activeSection={section}
              onSectionChange={setSection}
              counts={{ all: allContent.length, drafts: drafts.length }}
            />
          </>
        }
        ListEmptyComponent={renderEmpty}
      />
    </SafeAreaView>
  );
}
