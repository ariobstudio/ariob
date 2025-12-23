/**
 * AI Settings Screen
 *
 * Configure Ripple AI model and personality.
 */

import { useCallback, useState } from 'react';
import { View, ScrollView, Pressable, TextInput } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { StyleSheet } from 'react-native-unistyles';
import { Text, Stack, Row, useUnistyles } from '@ariob/andromeda';
import { useBar, Shell } from '@ariob/ripple';
import { useAISettings, MODEL_OPTIONS } from '@ariob/ml';

export default function AISettingsScreen() {
  const { theme } = useUnistyles();
  const bar = useBar();
  const { profile, model, modelOptions, setModel, updateProfile } = useAISettings();

  const [customPrompt, setCustomPrompt] = useState(profile.systemPrompt ?? '');

  // Bar actions
  const handleBack = useCallback(() => {
    router.back();
  }, []);

  // Set up bar when screen gains focus
  useFocusEffect(
    useCallback(() => {
      bar.setActions({
        leading: [{ icon: 'arrow-back', onPress: handleBack }],
      });
    }, [bar.setActions, handleBack])
  );

  const handleModelSelect = useCallback(
    (modelId: string) => {
      setModel(modelId);
    },
    [setModel]
  );

  const handleSavePrompt = useCallback(() => {
    updateProfile({
      systemPrompt: customPrompt.trim() || null,
    });
  }, [updateProfile, customPrompt]);

  const handleResetPrompt = useCallback(() => {
    setCustomPrompt('');
    updateProfile({ systemPrompt: null });
  }, [updateProfile]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Header */}
        <Text size="title" color="text" style={styles.title}>
          AI Settings
        </Text>

        {/* Model Selection */}
        <Stack gap="sm">
          <Text size="body" color="dim" style={styles.sectionTitle}>
            Model
          </Text>
          {modelOptions.map((option) => (
            <Pressable key={option.id} onPress={() => handleModelSelect(option.id)}>
              <Shell
                style={[
                  styles.modelOption,
                  option.id === model.id && {
                    borderColor: theme.colors.accent,
                    borderWidth: 2,
                  },
                ]}
              >
                <Row justify="between" align="center">
                  <Stack gap="xs">
                    <Text size="body" color="text" style={styles.modelName}>
                      {option.name}
                    </Text>
                    <Text size="caption" color="dim">
                      {option.description}
                    </Text>
                    <Text size="caption" color="dim">
                      RAM: {option.ramRequired}
                    </Text>
                  </Stack>
                  {option.id === model.id && (
                    <View style={[styles.checkmark, { backgroundColor: theme.colors.accent }]}>
                      <Text size="caption" color="bg">
                        ✓
                      </Text>
                    </View>
                  )}
                </Row>
              </Shell>
            </Pressable>
          ))}
        </Stack>

        {/* Custom System Prompt */}
        <Stack gap="sm" style={styles.section}>
          <Text size="body" color="dim" style={styles.sectionTitle}>
            Custom Personality (Optional)
          </Text>
          <Shell style={styles.promptContainer}>
            <TextInput
              style={[styles.promptInput, { color: theme.colors.text }]}
              value={customPrompt}
              onChangeText={setCustomPrompt}
              placeholder="Add custom instructions for Ripple..."
              placeholderTextColor={theme.colors.dim}
              multiline
              numberOfLines={4}
            />
          </Shell>
          <Row gap="sm">
            <Pressable onPress={handleSavePrompt} style={styles.button}>
              <Shell style={[styles.buttonInner, { backgroundColor: theme.colors.accent }]}>
                <Text size="body" color="bg">
                  Save
                </Text>
              </Shell>
            </Pressable>
            <Pressable onPress={handleResetPrompt} style={styles.button}>
              <Shell style={styles.buttonInner}>
                <Text size="body" color="dim">
                  Reset
                </Text>
              </Shell>
            </Pressable>
          </Row>
        </Stack>

        {/* AI Name */}
        <Stack gap="sm" style={styles.section}>
          <Text size="body" color="dim" style={styles.sectionTitle}>
            AI Name
          </Text>
          <Shell style={styles.nameContainer}>
            <TextInput
              style={[styles.nameInput, { color: theme.colors.text }]}
              value={profile.name}
              onChangeText={(name) => updateProfile({ name })}
              placeholder="Ripple"
              placeholderTextColor={theme.colors.dim}
            />
          </Shell>
        </Stack>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: theme.space.lg,
    paddingBottom: 120,
  },
  title: {
    fontWeight: '700',
    marginBottom: theme.space.lg,
  },
  sectionTitle: {
    fontWeight: '600',
  },
  section: {
    marginTop: theme.space.xl,
  },
  modelOption: {
    padding: theme.space.md,
  },
  modelName: {
    fontWeight: '600',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promptContainer: {
    padding: theme.space.sm,
  },
  promptInput: {
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 14,
  },
  button: {
    flex: 1,
  },
  buttonInner: {
    alignItems: 'center',
    paddingVertical: theme.space.sm,
  },
  nameContainer: {
    padding: theme.space.sm,
  },
  nameInput: {
    fontSize: 16,
  },
}));
