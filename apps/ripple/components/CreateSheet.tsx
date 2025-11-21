/**
 * CreateSheet - Bottom sheet for creating content
 *
 * Slides up from BELOW with content type picker
 */

import React, { useCallback, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

interface CreateSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

type ContentType = {
  id: string;
  title: string;
  icon: any;
  description: string;
  route: string;
};

const CONTENT_TYPES: ContentType[] = [
  {
    id: 'text',
    title: 'Text Post',
    icon: 'document-text',
    description: 'Share your thoughts',
    route: '/create?type=text',
  },
  {
    id: 'image',
    title: 'Image',
    icon: 'image',
    description: 'Share photos',
    route: '/create?type=image',
  },
  {
    id: 'video',
    title: 'Video',
    icon: 'videocam',
    description: 'Share a video',
    route: '/create?type=video',
  },
  {
    id: 'poll',
    title: 'Poll',
    icon: 'bar-chart',
    description: 'Ask a question',
    route: '/create?type=poll',
  },
];

export function CreateSheet({ isOpen, onClose }: CreateSheetProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['50%'], []);

  React.useEffect(() => {
    if (isOpen) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isOpen]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  const handleSelectType = (type: ContentType) => {
    onClose();
    router.push(type.route as any);
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.indicator}
    >
      <BottomSheetView style={styles.content}>
        <Text style={styles.title}>Create Content</Text>
        <Text style={styles.subtitle}>Choose what you'd like to share</Text>

        <View style={styles.options}>
          {CONTENT_TYPES.map((type) => (
            <Pressable
              key={type.id}
              style={styles.option}
              onPress={() => handleSelectType(type)}
            >
              <View style={styles.optionIcon}>
                <Ionicons name={type.icon} size={24} color={theme.colors.text} />
              </View>
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>{type.title}</Text>
                <Text style={styles.optionDescription}>{type.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
            </Pressable>
          ))}
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: theme.colors.surface,
  },
  indicator: {
    backgroundColor: theme.colors.border,
  },
  content: {
    padding: theme.spacing.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
  },
  options: {
    gap: theme.spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: `${theme.colors.text}05`,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: `${theme.colors.border}40`,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${theme.colors.text}10`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
});
