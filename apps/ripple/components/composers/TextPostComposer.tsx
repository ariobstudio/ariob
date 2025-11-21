/**
 * Text Post Composer
 *
 * Beautiful, fluid composer for creating text posts.
 * Features: degree selection, rich text, tags, preview.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { Post, Degree } from '@ariob/ripple';

const DEGREE_OPTIONS: Array<{ value: Degree; label: string; color: string; icon: string }> = [
  { value: '0', label: 'Personal', color: '#FF6B9D', icon: 'person' },
  { value: '1', label: 'Connections', color: '#00E5FF', icon: 'people' },
  { value: '2', label: 'Extended', color: '#7C4DFF', icon: 'git-network' },
  { value: '3', label: 'Public', color: '#FFC107', icon: 'globe' },
];

export interface TextPostComposerProps {
  onPost: (post: Omit<Post, '#' | 'created' | 'type'>) => void;
  onCancel: () => void;
  author: string;
  authorAlias?: string;
}

export function TextPostComposer({ onPost, onCancel, author, authorAlias }: TextPostComposerProps) {
  const [content, setContent] = useState('');
  const [degree, setDegree] = useState<Degree>('1');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const selectedDegree = DEGREE_OPTIONS.find((d) => d.value === degree)!;
  const charCount = content.length;
  const maxChars = 1000;
  const canPost = content.trim().length > 0 && charCount <= maxChars;

  const handlePost = () => {
    if (!canPost) return;

    onPost({
      author,
      authorAlias,
      content: content.trim(),
      degree,
      tags: tags.length > 0 ? tags : undefined,
    });
  };

  const addTag = () => {
    const trimmed = tagInput.trim().toLowerCase().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed) && tags.length < 5) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={onCancel} style={styles.cancelButton}>
            <Ionicons name="close" size={28} color="#9BA8B8" />
          </Pressable>
          <Text style={styles.headerTitle}>New Post</Text>
          <Pressable
            onPress={handlePost}
            disabled={!canPost}
            style={[styles.postButton, !canPost && styles.postButtonDisabled]}
          >
            <LinearGradient
              colors={canPost ? ['#00E5FF', '#1DE9B6'] : ['#3D4857', '#3D4857']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.postButtonGradient}
            >
              <Text style={[styles.postButtonText, !canPost && styles.postButtonTextDisabled]}>
                Post
              </Text>
            </LinearGradient>
          </Pressable>
        </View>

        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Content input */}
          <View style={styles.contentSection}>
            <TextInput
              style={styles.contentInput}
              placeholder="What's on your mind?"
              placeholderTextColor="#5F6D7E"
              value={content}
              onChangeText={setContent}
              multiline
              maxLength={maxChars}
              autoFocus
            />
            <Text style={[styles.charCount, charCount > maxChars * 0.9 && styles.charCountWarning]}>
              {charCount} / {maxChars}
            </Text>
          </View>

          {/* Degree selector */}
          <View style={styles.degreeSection}>
            <Text style={styles.sectionLabel}>Who can see this?</Text>
            <View style={styles.degreeOptions}>
              {DEGREE_OPTIONS.map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => setDegree(option.value)}
                  style={[
                    styles.degreeOption,
                    degree === option.value && styles.degreeOptionActive,
                    { borderColor: option.color },
                  ]}
                >
                  <Ionicons
                    name={option.icon as any}
                    size={20}
                    color={degree === option.value ? option.color : '#9BA8B8'}
                  />
                  <Text
                    style={[
                      styles.degreeLabel,
                      degree === option.value && { color: option.color },
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Tags */}
          <View style={styles.tagsSection}>
            <Text style={styles.sectionLabel}>Tags (optional)</Text>

            {tags.length > 0 && (
              <View style={styles.tagsList}>
                {tags.map((tag) => (
                  <Pressable
                    key={tag}
                    onPress={() => removeTag(tag)}
                    style={styles.tagChip}
                  >
                    <Text style={styles.tagChipText}>#{tag}</Text>
                    <Ionicons name="close-circle" size={16} color="#00E5FF" />
                  </Pressable>
                ))}
              </View>
            )}

            {tags.length < 5 && (
              <View style={styles.tagInputContainer}>
                <TextInput
                  style={styles.tagInput}
                  placeholder="Add a tag..."
                  placeholderTextColor="#5F6D7E"
                  value={tagInput}
                  onChangeText={setTagInput}
                  onSubmitEditing={addTag}
                  returnKeyType="done"
                />
                {tagInput.length > 0 && (
                  <Pressable onPress={addTag} style={styles.tagAddButton}>
                    <Ionicons name="add-circle" size={24} color="#00E5FF" />
                  </Pressable>
                )}
              </View>
            )}
          </View>

          {/* Preview */}
          {content.trim().length > 0 && (
            <View style={styles.previewSection}>
              <Text style={styles.sectionLabel}>Preview</Text>
              <View
                style={[
                  styles.previewCard,
                  { borderLeftColor: selectedDegree.color, borderLeftWidth: 3 },
                ]}
              >
                <Text style={styles.previewAuthor}>{authorAlias || author}</Text>
                <Text style={styles.previewContent} numberOfLines={4}>
                  {content.trim()}
                </Text>
                {tags.length > 0 && (
                  <View style={styles.previewTags}>
                    {tags.map((tag) => (
                      <Text key={tag} style={styles.previewTag}>
                        #{tag}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E14',
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(155, 168, 184, 0.08)',
  },
  cancelButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#ECEFF4',
    textAlign: 'center',
    marginRight: 32,
  },
  postButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  postButtonDisabled: {
    opacity: 0.5,
  },
  postButtonGradient: {
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  postButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0A0E14',
  },
  postButtonTextDisabled: {
    color: '#9BA8B8',
  },
  scrollContent: {
    flex: 1,
  },
  contentSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(155, 168, 184, 0.08)',
  },
  contentInput: {
    fontSize: 17,
    lineHeight: 26,
    color: '#ECEFF4',
    minHeight: 150,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 13,
    color: '#5F6D7E',
    textAlign: 'right',
    marginTop: 8,
  },
  charCountWarning: {
    color: '#FFB74D',
  },
  degreeSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(155, 168, 184, 0.08)',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9BA8B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  degreeOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  degreeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#1C2533',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  degreeOptionActive: {
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
  },
  degreeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9BA8B8',
  },
  tagsSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(155, 168, 184, 0.08)',
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(0, 229, 255, 0.12)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.25)',
  },
  tagChipText: {
    fontSize: 14,
    color: '#00E5FF',
    fontWeight: '500',
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C2533',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  tagInput: {
    flex: 1,
    fontSize: 15,
    color: '#ECEFF4',
    paddingVertical: 12,
  },
  tagAddButton: {
    padding: 4,
  },
  previewSection: {
    padding: 20,
  },
  previewCard: {
    backgroundColor: '#1C2533',
    borderRadius: 12,
    padding: 16,
  },
  previewAuthor: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ECEFF4',
    marginBottom: 8,
  },
  previewContent: {
    fontSize: 15,
    lineHeight: 22,
    color: '#ECEFF4',
  },
  previewTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  previewTag: {
    fontSize: 13,
    color: '#00E5FF',
  },
});
