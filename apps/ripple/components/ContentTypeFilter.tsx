/**
 * ContentTypeFilter - Filter posts by content type
 *
 * Allows filtering by: All, Post, Image, Video, Poll, Share
 */

// CRITICAL: Import Unistyles configuration first
import '../unistyles.config';

import { ScrollView, Text, Pressable } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

export type ContentType = 'all' | 'post' | 'image-post' | 'video-post' | 'poll' | 'share';

interface ContentTypeOption {
  id: ContentType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const CONTENT_TYPES: ContentTypeOption[] = [
  { id: 'all', label: 'All', icon: 'apps' },
  { id: 'post', label: 'Text', icon: 'document-text' },
  { id: 'image-post', label: 'Photos', icon: 'image' },
  { id: 'video-post', label: 'Videos', icon: 'videocam' },
  { id: 'poll', label: 'Polls', icon: 'bar-chart' },
  { id: 'share', label: 'Shares', icon: 'repeat' },
];

interface ContentTypeFilterProps {
  selectedType: ContentType;
  onTypeChange: (type: ContentType) => void;
}

const stylesheet = StyleSheet.create((theme) => ({
  container: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  pillActive: {
    backgroundColor: theme.colors.text,
    borderColor: theme.colors.text,
  },
  iconActive: {
    color: theme.colors.background,
  },
  iconInactive: {
    color: theme.colors.textSecondary,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  pillTextActive: {
    color: theme.colors.background,
  },
}));

export function ContentTypeFilter({ selectedType, onTypeChange }: ContentTypeFilterProps) {
  const { theme } = useUnistyles();
  const styles = stylesheet;
  
  const handlePress = (type: ContentType) => {
    if (type !== selectedType) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onTypeChange(type);
    }
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      bounces={false}
    >
      {CONTENT_TYPES.map((type) => (
        <FilterPill
          key={type.id}
          type={type}
          isActive={selectedType === type.id}
          onPress={() => handlePress(type.id)}
        />
      ))}
    </ScrollView>
  );
}

function FilterPill({
  type,
  isActive,
  onPress,
}: {
  type: ContentTypeOption;
  isActive: boolean;
  onPress: () => void;
}) {
  const { theme } = useUnistyles();
  const styles = stylesheet;
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSpring(isActive ? 1 : 0.96, {
          damping: 15,
          stiffness: 200,
        }),
      },
    ],
  }));

  return (
    <Pressable onPress={onPress}>
      <Animated.View style={[styles.pill, isActive && styles.pillActive, animatedStyle]}>
        <Ionicons
          name={type.icon}
          size={16}
          style={isActive ? styles.iconActive : styles.iconInactive}
        />
        <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
          {type.label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}
