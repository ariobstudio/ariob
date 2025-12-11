/**
 * ProfileTabs - Segment control for profile sections
 *
 * Tabs: Drafts | Published | Friends | Activity
 * Refactored to use Unistyles for theme reactivity
 */

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

export type ProfileTab = 'drafts' | 'published' | 'friends' | 'activity';

export interface ProfileTabsProps {
  activeTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
  draftsCount?: number;
  publishedCount?: number;
}

const TABS: Array<{ id: ProfileTab; label: string }> = [
  { id: 'published', label: 'Published' },
  { id: 'drafts', label: 'Drafts' },
  { id: 'friends', label: 'Friends' },
  { id: 'activity', label: 'Activity' },
];

export function ProfileTabs({
  activeTab,
  onTabChange,
  draftsCount,
  publishedCount
}: ProfileTabsProps) {
  return (
    <View style={styles.container}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        const count =
          tab.id === 'drafts' ? draftsCount :
          tab.id === 'published' ? publishedCount :
          undefined;

        return (
          <Pressable
            key={tab.id}
            onPress={() => onTabChange(tab.id)}
            style={[styles.tab, isActive && styles.tabActive]}
          >
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {tab.label}
            </Text>
            {count !== undefined && (
              <Text style={[styles.tabCount, isActive && styles.tabCountActive]}>
                {count}
              </Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSubtle,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radii.sm,
    backgroundColor: theme.colors.surfaceMuted,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: theme.colors.surface,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  tabLabelActive: {
    color: theme.colors.textPrimary,
  },
  tabCount: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textMuted,
  },
  tabCountActive: {
    color: theme.colors.textPrimary,
  },
}));
