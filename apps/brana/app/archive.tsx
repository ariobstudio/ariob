import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FontAwesome6 } from '@expo/vector-icons';
import { loadPapers, saveCurrentPaperId, generateTitle } from '../utils/storage';
import { HtmlPreview } from '../components/HtmlPreview';
import type { PaperItem } from '../types/paper';
import { useThemeColor } from '@/constants/theme';
import { textStyles, fontSize, fontFamily } from '@/constants/typography';

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const paperDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (paperDate.getTime() === today.getTime()) {
    return 'Today';
  } else if (paperDate.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: paperDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  }
}

function groupPapersByDate(papers: PaperItem[]): Record<string, PaperItem[]> {
  const groups: Record<string, PaperItem[]> = {};

  const sortedPapers = [...papers].sort((a, b) => b.data.updatedAt - a.data.updatedAt);

  for (const paper of sortedPapers) {
    const dateKey = formatDate(paper.data.updatedAt);
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(paper);
  }

  return groups;
}

export default function ArchiveScreen() {
  const [papers, setPapers] = useState<PaperItem[]>([]);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colorScheme = useColorScheme();

  // Theme colors - use direct values for consistency
  const backgroundColor = colorScheme === 'dark' ? '#121212' : '#E4E4E4';
  const foregroundColor = useThemeColor('foreground');
  const mutedColor = useThemeColor('muted');
  const placeholderColor = useThemeColor('field-placeholder');
  const borderColor = useThemeColor('border');

  useEffect(() => {
    loadPapers().then(setPapers);
  }, []);

  const groupedPapers = useMemo(() => groupPapersByDate(papers), [papers]);
  const dateGroups = Object.keys(groupedPapers);

  const handlePaperPress = useCallback(async (paperId: string) => {
    await saveCurrentPaperId(paperId);
    router.back();
  }, [router]);

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <FontAwesome6 name="arrow-left" size={18} color={mutedColor as string} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: foregroundColor as string }]}>Archive</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {papers.length === 0 ? (
          <View style={styles.emptyState}>
            <FontAwesome6 name="box-archive" size={32} color={borderColor as string} />
            <Text style={[styles.emptyText, { color: placeholderColor as string }]}>No papers yet</Text>
          </View>
        ) : (
          dateGroups.map((dateKey) => (
            <View key={dateKey} style={styles.dateGroup}>
              <Text style={[styles.dateLabel, { color: mutedColor as string }]}>{dateKey}</Text>
              {groupedPapers[dateKey].map((paper) => (
                <Pressable
                  key={paper.id}
                  onPress={() => handlePaperPress(paper.id)}
                  style={({ pressed }) => [
                    styles.paperItem,
                    pressed && styles.paperItemPressed,
                  ]}
                >
                  <Text style={[styles.paperTitle, { color: foregroundColor as string }]} numberOfLines={1}>
                    {paper.data.content ? generateTitle(paper.data.content) : 'Untitled'}
                  </Text>
                  {paper.data.content ? (
                    <HtmlPreview
                      html={paper.data.content}
                      numberOfLines={2}
                      style={{ ...styles.paperPreview, color: mutedColor as string }}
                    />
                  ) : null}
                </Pressable>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
  },
  headerTitle: {
    ...textStyles.h3,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  emptyState: {
    paddingVertical: 64,
    alignItems: 'center',
  },
  emptyText: {
    ...textStyles.body,
    marginTop: 16,
  },
  dateGroup: {
    marginBottom: 24,
  },
  dateLabel: {
    fontSize: fontSize.xs,
    fontFamily: fontFamily.monoMedium,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  paperItem: {
    paddingVertical: 12,
  },
  paperItemPressed: {
    opacity: 0.6,
  },
  paperTitle: {
    fontSize: fontSize.lg,
    fontFamily: fontFamily.monoMedium,
  },
  paperPreview: {
    ...textStyles.bodySmall,
    marginTop: 4,
  },
});
