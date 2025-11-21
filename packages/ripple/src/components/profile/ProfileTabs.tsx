/**
 * ProfileTabs - Segment control for profile sections
 *
 * Tabs: Drafts | Published | Friends | Activity
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

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

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
  },
  tabLabelActive: {
    color: '#FFF',
  },
  tabCount: {
    fontSize: 18,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.4)',
  },
  tabCountActive: {
    color: '#FFF',
  },
});
