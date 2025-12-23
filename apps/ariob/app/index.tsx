/**
 * Main Screen - Degree Feed Navigation
 *
 * Simple degree selector with feed content.
 * Uses useBar() hook to configure the global Bar.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { View, Platform, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { list as listDegrees, type DegreeId, useBar } from '@ariob/ripple';
import { useUnistyles } from '@ariob/andromeda';

import { DegreeSelector, ProfileCard, AICard, type DegreeConfig } from '../components';
import { CreateAccountSheet } from '../components/sheets';
import { useAuthFlow } from '../hooks';

// All available degrees
const ALL_DEGREES: DegreeConfig[] = listDegrees()
  .filter((d) => d.id <= 3)
  .map((d) => ({ id: d.id, name: d.name }));

/**
 * Get unlocked degrees based on user progress
 * New users start with only degree 0 (Me)
 * More degrees unlock as they connect with others
 */
function getUnlockedDegrees(user: import('@ariob/core').User | null): DegreeConfig[] {
  if (!user) {
    // Not authenticated - show only Me degree
    return ALL_DEGREES.filter((d) => d.id === 0);
  }

  // TODO: Check actual connections to unlock degrees progressively
  // For now: authenticated users see degree 0 only until they have connections
  // Degree 0: Me (always)
  // Degree 1: Friends (when has connections)
  // Degree 2: Network (when friends have connections)
  // Degree 3: World (always available once authenticated)

  // For MVP: just show degree 0 for new users
  return ALL_DEGREES.filter((d) => d.id === 0);
}

export default function Index() {
  const { theme } = useUnistyles();
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated, isLoading } = useAuthFlow();
  const bar = useBar();

  // Get unlocked degrees based on user progress
  const unlockedDegrees = getUnlockedDegrees(isAuthenticated ? user : null);
  const [degree, setDegree] = useState<DegreeId>(0); // Start at Me

  // Open account sheet handler
  const openAccountSheet = useCallback(() => {
    bar.openSheet(<CreateAccountSheet onClose={() => bar.pop()} />);
  }, [bar]);

  // Keep a ref for use in effects
  const openAccountSheetRef = useRef(openAccountSheet);
  openAccountSheetRef.current = openAccountSheet;

  // Set up bar actions when screen gains focus
  useFocusEffect(
    useCallback(() => {
      bar.setActions({
        primary: { icon: 'add', onPress: () => openAccountSheetRef.current() },
        trailing: [{ icon: 'ellipsis-vertical', onPress: () => console.log('Menu pressed') }],
      });
    }, [bar.setActions])
  );

  // Open account sheet if not authenticated (after loading)
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      openAccountSheetRef.current();
    }
  }, [isLoading, isAuthenticated]);

  // Handle degree change with haptics
  const handleDegreeChange = useCallback((newDegree: number) => {
    if (newDegree !== degree) {
      if (Platform.OS === 'ios') {
        Haptics.selectionAsync();
      }
      setDegree(newDegree as DegreeId);
    }
  }, [degree]);

  // Handle profile card press
  const handleProfilePress = useCallback(() => {
    if (user) {
      router.push(`/profile/${user.pub}`);
    }
  }, [user]);

  // Handle AI card press
  const handleAIPress = useCallback(() => {
    router.push('/ai');
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      {/* Degree Selector - only show if more than one degree unlocked */}
      {unlockedDegrees.length > 1 && (
        <View style={[styles.header, { paddingTop: insets.top, paddingBottom: theme.space.md }]}>
          <DegreeSelector
            degrees={unlockedDegrees}
            activeDegree={degree}
            onDegreeChange={handleDegreeChange}
          />
        </View>
      )}

      {/* Feed Content */}
      <FeedPage
        degree={degree}
        user={isAuthenticated ? user : null}
        onProfilePress={handleProfilePress}
        onAIPress={handleAIPress}
        topInset={unlockedDegrees.length <= 1 ? insets.top : 0}
      />
    </View>
  );
}

// Feed item type
interface FeedItem {
  id: string;
  type: 'profile' | 'ai';
}

// Feed Page Content
interface FeedPageProps {
  degree: DegreeId;
  user: import('@ariob/core').User | null;
  onProfilePress: () => void;
  onAIPress: () => void;
  topInset: number;
}

function FeedPage({ degree, user, onProfilePress, onAIPress, topInset }: FeedPageProps) {
  // Build feed items based on degree
  const feedItems: FeedItem[] = [];
  if (user && degree === 0) {
    feedItems.push({ id: 'profile', type: 'profile' });
    feedItems.push({ id: 'ai', type: 'ai' });
  }

  const renderItem = ({ item }: { item: FeedItem }) => {
    if (item.type === 'profile' && user) {
      return <ProfileCard user={user} onPress={onProfilePress} />;
    }
    if (item.type === 'ai') {
      return <AICard onPress={onAIPress} />;
    }
    return null;
  };

  return (
    <FlatList
      data={feedItems}
      inverted
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={[
        styles.feedContent,
        // With inverted, paddingBottom = visual top
        { paddingBottom: topInset + 16 },
      ]}
      style={styles.page}
    />
  );
}

const styles = {
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  page: {
    flex: 1,
  },
  feedContent: {
    flexGrow: 1,
    paddingTop: 120, // Space above bar (inverted, so paddingTop = visual bottom)
  },
};
