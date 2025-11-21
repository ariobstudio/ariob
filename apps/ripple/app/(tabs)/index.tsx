/**
 * Home Feed - Unified Timeline with Node System
 *
 * Refactored to use the new node-based architecture and real data from @ariob/ripple.
 */

// CRITICAL: Import Unistyles configuration first
import '../../unistyles.config';

import { useState, useEffect, useRef, useMemo } from 'react';
import { View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import PagerView from 'react-native-pager-view';
import { DegreeFilterPill, type DegreeValue } from '../../components/DegreeFilterPill';
import { ContentTypeFilter, type ContentType } from '../../components/ContentTypeFilter';
import { FeedView } from '../../components/views/FeedView';
import { ProfileView } from '../../components/ProfileView';
import { useFeed, type FeedItem } from '@ariob/ripple';

export default function HomeScreen() {
  const { theme } = useUnistyles();
  const styles = stylesheet;
  const [currentDegree, setCurrentDegree] = useState<DegreeValue>(1);
  const [contentType, setContentType] = useState<ContentType>('all');
  const pagerRef = useRef<PagerView>(null);

  const handleDegreeChange = (degree: DegreeValue) => {
    setCurrentDegree(degree);
    pagerRef.current?.setPage(degree);
  };

  const handlePageSelected = (e: any) => {
    const newDegree = e.nativeEvent.position as DegreeValue;
    setCurrentDegree(newDegree);
    if (newDegree !== currentDegree) {
      Haptics.selectionAsync();
    }
  };

  const handleContentTypeChange = (type: ContentType) => {
    setContentType(type);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.header}>
        <DegreeFilterPill currentDegree={currentDegree} onDegreeChange={handleDegreeChange} />
      </SafeAreaView>

      {/* Content Type Filter */}
      <View style={styles.contentTypeFilterContainer}>
        <ContentTypeFilter selectedType={contentType} onTypeChange={handleContentTypeChange} />
      </View>

      {/* Swipeable Degree Pages */}
      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={1}
        onPageSelected={handlePageSelected}
      >
        {[0, 1, 2, 3].map((degree) => (
          <View key={degree} style={styles.page}>
            <DegreeFeed
              degree={degree as DegreeValue}
              contentType={contentType}
            />
          </View>
        ))}
      </PagerView>
    </View>
  );
}

function DegreeFeed({
  degree,
  contentType,
}: {
  degree: DegreeValue;
  contentType: ContentType;
}) {
  // For degree 0, show ProfileView (Me page)
  if (degree === 0) {
    return <ProfileView />;
  }

  // Use real data hook
  const { items, loading, refresh } = useFeed({ degree: String(degree) as any });
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    if (refresh) await refresh();
    setRefreshing(false);
  };

  const handleLoadMore = () => {
    // Pagination logic if needed
  };

  // Transform Collection Items to Feed Items
  const feedItems = useMemo(() => {
    return items.map(item => ({
      ...item.data,
      '#': item.id,
      id: item.id
    })) as FeedItem[];
  }, [items]);

  // Filter by content type
  const filteredItems = useMemo(() => {
    return feedItems.filter((item) => {
      if (contentType === 'all') return true;

      const typeMap: Partial<Record<ContentType, string[]>> = {
        'post': ['post'],
        'image-post': ['image-post'],
        'video-post': ['video-post'],
        'poll': ['poll'],
        'share': ['share']
      };

      const allowedTypes = typeMap[contentType];
      return allowedTypes?.includes(item.type) ?? false;
    });
  }, [feedItems, contentType]);

  return (
    <FeedView
      items={filteredItems}
      loading={loading}
      refreshing={refreshing}
      onRefresh={handleRefresh}
      onLoadMore={handleLoadMore}
      hasMore={false}
    />
  );
}

const stylesheet = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    // Removed border for cleaner look
  },
  contentTypeFilterContainer: {
    // Added subtle separation if needed, but kept minimal
    backgroundColor: theme.colors.background,
    paddingBottom: theme.spacing.xs,
  },
  pager: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
}));
