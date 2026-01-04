/**
 * CreateAccountSheet - Account creation and key import UI
 *
 * Two modes:
 * 1. Create - Enter username to generate new account
 * 2. Import - Paste JSON keypair to restore existing account
 *
 * Uses Reanimated worklets for smooth height + opacity transitions.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { View, Keyboard, TextInput as RNTextInput, type LayoutChangeEvent } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { Text, Input, Button, Stack, useUnistyles } from '@ariob/andromeda';
import { create, auth, type KeyPair } from '@ariob/core';

type Mode = 'create' | 'import';

interface CreateAccountSheetProps {
  onClose: () => void;
}

// Fast timing config
const TIMING_CONFIG = {
  duration: 150,
  easing: Easing.out(Easing.ease),
};

export function CreateAccountSheet({ onClose }: CreateAccountSheetProps) {
  const { theme } = useUnistyles();
  const [mode, setMode] = useState<Mode>('create');
  const [username, setUsername] = useState('');
  const [keysJson, setKeysJson] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Shared values for animation
  const modeProgress = useSharedValue(0); // 0 = create, 1 = import
  const createHeight = useSharedValue(0);
  const importHeight = useSharedValue(0);

  // Ref for JSON input focus management
  const jsonInputRef = useRef<RNTextInput>(null);
  const usernameInputRef = useRef<RNTextInput>(null);

  const isCreateValid = username.trim().length >= 2;
  const isImportValid = keysJson.trim().length > 10;

  // Measure content heights
  const handleCreateLayout = useCallback((e: LayoutChangeEvent) => {
    const height = e.nativeEvent.layout.height;
    if (height > 0) createHeight.value = height;
  }, []);

  const handleImportLayout = useCallback((e: LayoutChangeEvent) => {
    const height = e.nativeEvent.layout.height;
    if (height > 0) importHeight.value = height;
  }, []);

  // Animated container height - interpolates between the two measured heights
  const containerStyle = useAnimatedStyle(() => {
    'worklet';
    // Use measured heights, fallback to reasonable defaults
    const fromHeight = createHeight.value || 150;
    const toHeight = importHeight.value || 250;
    return {
      height: interpolate(modeProgress.value, [0, 1], [fromHeight, toHeight]),
    };
  });

  // Animated styles for cross-fade with opacity
  const createModeStyle = useAnimatedStyle(() => {
    'worklet';
    return { opacity: interpolate(modeProgress.value, [0, 0.5], [1, 0]) };
  });

  const importModeStyle = useAnimatedStyle(() => {
    'worklet';
    return { opacity: interpolate(modeProgress.value, [0.5, 1], [0, 1]) };
  });

  // Validate and parse JSON keys
  const parseKeys = (json: string): KeyPair | null => {
    try {
      const parsed = JSON.parse(json);
      // Validate required fields
      if (
        typeof parsed.pub === 'string' &&
        typeof parsed.priv === 'string' &&
        typeof parsed.epub === 'string' &&
        typeof parsed.epriv === 'string'
      ) {
        return parsed as KeyPair;
      }
      console.log('[CreateAccountSheet] Invalid key structure:', Object.keys(parsed));
      return null;
    } catch (e) {
      console.log('[CreateAccountSheet] JSON parse error:', e);
      return null;
    }
  };

  const handleCreate = async () => {
    const trimmed = username.trim();
    if (trimmed.length < 2) {
      setError('Username must be at least 2 characters');
      return;
    }

    Keyboard.dismiss();
    setLoading(true);
    setError(null);

    console.log('[CreateAccountSheet] Creating account for:', trimmed);

    const result = await create(trimmed);

    console.log('[CreateAccountSheet] Create result:', result.ok ? 'success' : 'failed');
    if (!result.ok) {
      console.log('[CreateAccountSheet] Error:', result.error);
    } else {
      console.log('[CreateAccountSheet] User created:', result.value);
    }

    if (result.ok) {
      onClose();
    } else {
      setError(result.error?.message || 'Failed to create account');
      setLoading(false);
    }
  };

  const handleImport = async () => {
    Keyboard.dismiss();
    setError(null);

    console.log('[CreateAccountSheet] Attempting to import keys...');

    const keys = parseKeys(keysJson.trim());
    if (!keys) {
      setError('Invalid key format. Ensure JSON has: pub, priv, epub, epriv');
      return;
    }

    console.log('[CreateAccountSheet] Keys parsed, pub:', keys.pub.slice(0, 20) + '...');

    setLoading(true);

    const result = await auth(keys);

    console.log('[CreateAccountSheet] Import result:', result.ok ? 'success' : 'failed');
    if (!result.ok) {
      console.log('[CreateAccountSheet] Error:', result.error);
    } else {
      console.log('[CreateAccountSheet] User imported:', result.value);
    }

    if (result.ok) {
      onClose();
    } else {
      setError(result.error?.message || 'Failed to import keys');
      setLoading(false);
    }
  };

  // Toggle between modes - animate and update state
  const toggleMode = () => {
    const newMode = mode === 'create' ? 'import' : 'create';
    setMode(newMode);
    setError(null);
    // Animate to new mode
    modeProgress.value = withTiming(newMode === 'import' ? 1 : 0, TIMING_CONFIG);
  };

  // Focus the appropriate input when switching modes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mode === 'import') {
        jsonInputRef.current?.focus();
      } else {
        usernameInputRef.current?.focus();
      }
    }, 150); // Wait for animation to be mostly complete
    return () => clearTimeout(timer);
  }, [mode]);

  return (
    <View style={[styles.container, { paddingHorizontal: theme.space.lg }]}>
      <Stack gap="md">
        {/* Header */}
        <Text size="title" color="text" style={styles.title}>
          {mode === 'create' ? 'Create Account' : 'Import Keys'}
        </Text>

        <Text size="body" color="dim">
          {mode === 'create'
            ? 'Choose a username to get started'
            : 'Paste your JSON keypair to restore your account'}
        </Text>

        {/* Mode content container - animates height, cross-fades content */}
        <Animated.View style={[styles.modeContainer, containerStyle]}>
          {/* Create mode content */}
          <Animated.View
            style={[styles.modeContent, createModeStyle]}
            pointerEvents={mode === 'create' ? 'auto' : 'none'}
            onLayout={handleCreateLayout}
          >
            <View style={styles.inputWrapper}>
              <Input
                ref={usernameInputRef}
                value={username}
                onChangeText={setUsername}
                placeholder="Username"
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus={mode === 'create'}
                error={mode === 'create' ? error || undefined : undefined}
                leftIcon="person-outline"
                returnKeyType="done"
                onSubmitEditing={handleCreate}
              />
            </View>

            <Button
              onPress={handleCreate}
              loading={loading}
              disabled={!isCreateValid || loading}
              tint="accent"
              size="lg"
            >
              Create Account
            </Button>
          </Animated.View>

          {/* Import mode content */}
          <Animated.View
            style={[styles.modeContent, styles.absoluteFill, importModeStyle]}
            pointerEvents={mode === 'import' ? 'auto' : 'none'}
            onLayout={handleImportLayout}
          >
            <View style={styles.inputWrapper}>
              <RNTextInput
                ref={jsonInputRef}
                value={keysJson}
                onChangeText={setKeysJson}
                placeholder='{"pub":"...","priv":"...","epub":"...","epriv":"..."}'
                placeholderTextColor={theme.colors.dim}
                autoCapitalize="none"
                autoCorrect={false}
                multiline
                numberOfLines={4}
                style={[
                  styles.jsonInput,
                  {
                    color: theme.colors.text,
                    backgroundColor: theme.colors.surface,
                    borderColor: mode === 'import' && error ? theme.colors.danger : theme.colors.border,
                  },
                ]}
              />
              {mode === 'import' && error && (
                <Text size="caption" color="danger" style={styles.errorText}>
                  {error}
                </Text>
              )}
            </View>

            <Button
              onPress={handleImport}
              loading={loading}
              disabled={!isImportValid || loading}
              tint="accent"
              size="lg"
            >
              Import Keys
            </Button>
          </Animated.View>
        </Animated.View>

        {/* Toggle mode button */}
        <Button
          onPress={toggleMode}
          variant="ghost"
          tint="default"
          size="md"
          disabled={loading}
        >
          {mode === 'create' ? 'Import Existing Keys' : 'Create New Account'}
        </Button>
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    paddingTop: theme.space.lg,
    paddingBottom: theme.space.lg,
  },
  title: {
    fontWeight: '700',
  },
  modeContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  modeContent: {
    width: '100%',
  },
  absoluteFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  inputWrapper: {
    marginTop: theme.space.sm,
    marginBottom: theme.space.sm,
  },
  jsonInput: {
    fontSize: theme.typography.mono.fontSize,
    fontFamily: 'Courier',
    padding: theme.space.md,
    borderRadius: theme.radii.md,
    borderWidth: 1.5,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  errorText: {
    marginTop: theme.space.xs,
    marginLeft: theme.space.xs,
  },
}));
