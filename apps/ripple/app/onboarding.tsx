/**
 * Onboarding Screen - Welcome to Ariob
 *
 * Minimal, elegant onboarding focused on the core value proposition:
 * decentralized identity and sovereign social graph.
 */

// CRITICAL: Import Unistyles configuration first
import '../unistyles.config';

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import Animated, { 
  FadeIn, 
  FadeOut, 
  SlideInRight, 
  SlideOutLeft,
  Layout
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create, graph } from '@ariob/core';

const { width } = Dimensions.get('window');

const stylesheet = StyleSheet.create((theme) => ({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  illustrationContainer: {
    flex: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  illustrationContainerSmall: {
    flex: 0.5, // Shrink when input is shown
    paddingTop: theme.spacing.xl,
  },
  illustration: {
    width: '100%',
    height: '100%',
    maxHeight: 400,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.xxl,
    paddingBottom: theme.spacing.xl,
    justifyContent: 'flex-end',
    gap: theme.spacing.md,
  },
  inputContent: {
    flex: 1,
    paddingHorizontal: theme.spacing.xxl,
    paddingBottom: theme.spacing.xl,
    justifyContent: 'center', // Center input content
    gap: theme.spacing.lg,
  },
  heading: {
    fontSize: 42,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
    letterSpacing: -1,
    marginBottom: theme.spacing.xs,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto', 
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  inputTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  inputSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  primaryButton: {
    backgroundColor: theme.colors.text,
    borderRadius: theme.borderRadius.xl,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    width: '100%',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.background,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderRadius: theme.borderRadius.xl,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    borderWidth: 1,
    borderColor: theme.colors.border,
    width: '100%',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  nameInput: {
    fontSize: 18,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.xl,
    paddingVertical: 12,
    paddingHorizontal: theme.spacing.lg,
    textAlign: 'center',
    minHeight: 48,
    width: '100%',
  },
  error: {
    fontSize: 14,
    color: theme.colors.error || '#FF3B30',
    textAlign: 'center',
    marginTop: -theme.spacing.sm,
  },
  footer: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    opacity: 0.7,
  },
  placeholder: {
    color: theme.colors.textTertiary,
  },
  buttonText: {
    color: theme.colors.background,
  },
}));

export default function OnboardingScreen() {
  const router = useRouter();
  const { theme } = useUnistyles();
  const styles = stylesheet;
  const [name, setName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'landing' | 'input'>('landing');

  // Heuristic based on definition in theme.ts
  const isDark = theme.colors.background === '#121212'; 
  
  const illustrationSource = isDark
    ? require('../assets/images/illustration-dark.png')
    : require('../assets/images/illustration-light.png');

  const handleCreateNew = () => {
    setStep('input');
  };

  const handleAddExisting = () => {
    router.push('/import-keys');
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Please enter your alias.');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      // Create identity
      const result = await create(name.trim());

      if (!result.ok) {
        console.error('[Onboarding] Create failed:', result.error);
        setError(result.error?.message || 'Could not create identity.');
        setIsCreating(false);
        return;
      }

      // Save keys locally
      const g = graph();
      const userRef = g.user();
      const keypair = userRef._.sea;

      if (keypair) {
        const keysJson = JSON.stringify({
          pub: keypair.pub,
          priv: keypair.priv,
          epub: keypair.epub,
          epriv: keypair.epriv,
        });
        await AsyncStorage.setItem('userKeys', keysJson);
      }

      // Initialize profile
      const timestamp = Date.now();
      g.user().get('profile').put({
        alias: name.trim(),
        createdAt: timestamp,
        updatedAt: timestamp,
      });

      await AsyncStorage.setItem('hasOnboarded', 'true');
      router.replace('/(tabs)');
    } catch (err) {
      console.error('[Onboarding] Unexpected error:', err);
      setError('An unexpected error occurred.');
      setIsCreating(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.container}>
          {/* Illustration - Persistent but resizing */}
          <Animated.View 
            layout={Layout.springify()}
            style={[
              styles.illustrationContainer, 
              step === 'input' && styles.illustrationContainerSmall
            ]}
          >
            <Image
              source={illustrationSource}
              style={styles.illustration}
              resizeMode="contain"
            />
          </Animated.View>

          {/* Content Switcher */}
          {step === 'landing' ? (
            <Animated.View 
              key="landing"
              entering={FadeIn}
              exiting={FadeOut}
              style={styles.content}
            >
              <Text style={styles.heading}>Ariob</Text>
              <Text style={styles.subtitle}>
                The social graph for sovereign individuals.
                Own your identity, connect without intermediaries.
              </Text>

              <Pressable style={styles.primaryButton} onPress={handleCreateNew}>
                <Text style={styles.primaryButtonText}>Create Identity</Text>
              </Pressable>

              <Pressable style={styles.secondaryButton} onPress={handleAddExisting}>
                <Text style={styles.secondaryButtonText}>Import Keys</Text>
              </Pressable>

              <Text style={styles.footer}>
                Decentralized • Encrypted • Peer-to-Peer
              </Text>
            </Animated.View>
          ) : (
            <Animated.View 
              key="input"
              entering={SlideInRight}
              exiting={SlideOutLeft}
              style={styles.inputContent}
            >
              <Text style={styles.inputTitle}>Who are you?</Text>
              <Text style={styles.inputSubtitle}>
                Choose an alias. This is how others will see you on the graph.
              </Text>

              <TextInput
                style={styles.nameInput}
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  setError('');
                }}
                placeholder="Alias"
                placeholderTextColor={theme.colors.textTertiary}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleCreate}
                editable={!isCreating}
                autoCapitalize="none"
                autoCorrect={false}
              />

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Pressable
                style={[styles.primaryButton, (!name.trim() || isCreating) && styles.buttonDisabled]}
                onPress={handleCreate}
                disabled={!name.trim() || isCreating}
              >
                {isCreating ? (
                  <ActivityIndicator size="small" color={theme.colors.background} />
                ) : (
                  <Text style={styles.primaryButtonText}>Begin Journey</Text>
                )}
              </Pressable>

              <Text style={styles.footer}>
                Keys are generated locally. No servers, no tracking.
              </Text>
            </Animated.View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
