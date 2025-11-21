/**
 * Create Post Screen
 *
 * Twitter-style composer with blurred backdrop.
 */

// CRITICAL: Import Unistyles configuration first
import '../../unistyles.config';

import { useEffect, useRef, useCallback, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { router } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

const stylesheet = StyleSheet.create((theme) => ({
  absoluteFill: {
    ...StyleSheet.absoluteFillObject,
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  sheetBackground: {
    backgroundColor: theme.colors.background,
  },
  handleIndicator: {
    backgroundColor: theme.colors.border,
    width: 40,
    height: 4,
  },
  sheetContent: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
  },
  cancelButton: {
    paddingVertical: theme.spacing.xs,
  },
  cancelButtonText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  postButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    backgroundColor: '#1DA1F2',
    borderRadius: 20,
  },
  postButtonDisabled: {
    opacity: 0.5,
  },
  postButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  composer: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  inputContainer: {
    flex: 1,
  },
  input: {
    flex: 1,
    fontSize: 17,
    lineHeight: 22,
    color: theme.colors.text,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  placeholder: {
    color: theme.colors.textTertiary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: theme.spacing.md,
    borderTopWidth: 0.5,
    borderTopColor: theme.colors.border,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  charCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  charCount: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  charCountWarning: {
    color: '#FF9500',
  },
  charCountOver: {
    color: '#FF3B30',
  },
}));

export default function CreateScreen() {
  const { theme } = useUnistyles();
  const styles = stylesheet;
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [content, setContent] = useState('');
  const [charCount, setCharCount] = useState(0);
  const MAX_CHARS = 280; // Twitter-style character limit

  useEffect(() => {
    bottomSheetRef.current?.expand();
  }, []);

  const handleClose = useCallback(() => {
    Keyboard.dismiss();
    bottomSheetRef.current?.close();
    setTimeout(() => {
      router.back();
    }, 200);
  }, []);

  const handlePost = useCallback(() => {
    if (!content.trim()) return;

    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    console.log('Posting:', { content });
    setContent('');
    setCharCount(0);
    handleClose();
  }, [content, handleClose]);

  const handleContentChange = useCallback((text: string) => {
    if (text.length <= MAX_CHARS) {
      setContent(text);
      setCharCount(text.length);
    }
  }, []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <Pressable
        style={styles.absoluteFill}
        onPress={handleClose}
      >
        <BlurView
          {...props}
          intensity={20}
          tint="dark"
          style={StyleSheet.absoluteFill}
        />
      </Pressable>
    ),
    [handleClose]
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={['90%']}
        backdropComponent={renderBackdrop}
        onClose={handleClose}
        enablePanDownToClose
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <BottomSheetView style={styles.sheetContent}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            {/* Header - Twitter style */}
            <View style={styles.header}>
              <Pressable onPress={handleClose} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handlePost}
                disabled={!content.trim()}
                style={[
                  styles.postButton,
                  !content.trim() && styles.postButtonDisabled,
                ]}
              >
                <Text style={styles.postButtonText}>Post</Text>
              </Pressable>
            </View>

            {/* Composer */}
            <View style={styles.composer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>Y</Text>
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={content}
                  onChangeText={handleContentChange}
                  placeholder="What's happening?"
                  placeholderTextColor={styles.placeholder.color}
                  multiline
                  autoFocus
                  maxLength={MAX_CHARS}
                />

                {/* Character count */}
                <View style={styles.footer}>
                  <View style={styles.actions}>
                    <Pressable style={styles.actionButton}>
                      <Ionicons name="image-outline" size={22} color="#1DA1F2" />
                    </Pressable>
                    <Pressable style={styles.actionButton}>
                      <Ionicons name="stats-chart-outline" size={22} color="#1DA1F2" />
                    </Pressable>
                    <Pressable style={styles.actionButton}>
                      <Ionicons name="happy-outline" size={22} color="#1DA1F2" />
                    </Pressable>
                    <Pressable style={styles.actionButton}>
                      <Ionicons name="location-outline" size={22} color="#1DA1F2" />
                    </Pressable>
                  </View>

                  <View style={styles.charCountContainer}>
                    {charCount > 0 && (
                      <Text
                        style={[
                          styles.charCount,
                          charCount > MAX_CHARS * 0.9 && styles.charCountWarning,
                          charCount > MAX_CHARS && styles.charCountOver,
                        ]}
                      >
                        {MAX_CHARS - charCount}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </BottomSheetView>
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create((theme) => ({
  absoluteFill: {
    ...StyleSheet.absoluteFillObject,
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  sheetBackground: {
    backgroundColor: theme.colors.background,
  },
  handleIndicator: {
    backgroundColor: theme.colors.border,
    width: 40,
    height: 4,
  },
  sheetContent: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
  },
  cancelButton: {
    paddingVertical: theme.spacing.xs,
  },
  cancelButtonText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  postButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    backgroundColor: '#1DA1F2',
    borderRadius: 20,
  },
  postButtonDisabled: {
    opacity: 0.5,
  },
  postButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  composer: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  inputContainer: {
    flex: 1,
  },
  input: {
    flex: 1,
    fontSize: 17,
    lineHeight: 22,
    color: theme.colors.text,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  placeholder: {
    color: theme.colors.textTertiary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: theme.spacing.md,
    borderTopWidth: 0.5,
    borderTopColor: theme.colors.border,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  charCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  charCount: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  charCountWarning: {
    color: '#FF9500',
  },
  charCountOver: {
    color: '#FF3B30',
  },
}));
