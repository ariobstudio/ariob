/**
 * AccountSheet - Identity creation/import interface
 *
 * A proper sheet with vertical layout for:
 * - Creating new accounts with alias
 * - Importing existing keypairs
 *
 * Uses real authentication via @ariob/core
 */

import { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Ionicons } from '@expo/vector-icons';
import { create, auth, type KeyPair } from '@ariob/core';
import { toast } from '@ariob/andromeda';
import type { SheetComponentProps } from '@ariob/ripple';

type Mode = 'create' | 'import';

export function AccountSheet({ onClose }: SheetComponentProps) {
  const { theme } = useUnistyles();
  const [mode, setMode] = useState<Mode>('create');
  const [alias, setAlias] = useState('');
  const [keysJson, setKeysJson] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<TextInput>(null);

  const isCreate = mode === 'create';
  const canCreate = alias.trim().length >= 2;
  const canImport = keysJson.trim().length >= 32;
  const canSubmit = isCreate ? canCreate : canImport;

  // Auto-focus input once on mount (not on mode change to keep keyboard up)
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 200);
    return () => clearTimeout(timer);
  }, []);

  const handleCreate = async () => {
    if (!canCreate) return;
    setIsLoading(true);
    setError('');

    try {
      const result = await create(alias.trim());

      if (result.ok) {
        toast.success(`Welcome, ${result.value.alias}!`);
        onClose();
      } else {
        const errorMessage = result.error?.message || 'Failed to create account';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unexpected error';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    if (!canImport) return;
    setIsLoading(true);
    setError('');

    try {
      // Parse the JSON keypair
      const keys = JSON.parse(keysJson.trim()) as KeyPair;

      // Validate keypair structure
      if (!keys.pub || !keys.priv || !keys.epub || !keys.epriv) {
        throw new Error('Invalid keypair format. Must include pub, priv, epub, and epriv.');
      }

      const result = await auth(keys);

      if (result.ok) {
        toast.success(`Welcome back, ${result.value.alias || 'User'}!`);
        onClose();
      } else {
        const errorMessage = result.error?.message || 'Failed to import keys';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError('Invalid JSON format. Check your keys and try again.');
        toast.error('Invalid JSON format');
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Failed to import keys';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = isCreate ? handleCreate : handleImport;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {isCreate ? 'Create Account' : 'Import Keys'}
        </Text>
        <Pressable onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={20} color={theme.colors.textMuted} />
        </Pressable>
      </View>

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          ref={inputRef}
          style={[styles.input, !isCreate && styles.inputMultiline]}
          placeholder={isCreate ? 'Choose an alias...' : 'Paste your keypair JSON...'}
          placeholderTextColor={theme.colors.textMuted}
          value={isCreate ? alias : keysJson}
          onChangeText={(text) => {
            if (isCreate) {
              setAlias(text);
            } else {
              setKeysJson(text);
            }
            setError('');
          }}
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={isCreate ? 32 : 2000}
          returnKeyType={isCreate ? 'done' : 'default'}
          onSubmitEditing={isCreate ? handleSubmit : undefined}
          multiline={!isCreate}
          numberOfLines={!isCreate ? 3 : 1}
          editable={!isLoading}
        />
      </View>

      {/* Error Message */}
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}

      {/* Submit Button */}
      <Pressable
        onPress={handleSubmit}
        disabled={!canSubmit || isLoading}
        style={[styles.submitButton, (!canSubmit || isLoading) && styles.submitButtonDisabled]}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={theme.colors.background} />
        ) : (
          <Text style={styles.submitButtonText}>
            {isCreate ? 'Create' : 'Import'}
          </Text>
        )}
      </Pressable>

      {/* Mode Toggle */}
      <Pressable
        onPress={() => {
          setMode(isCreate ? 'import' : 'create');
          setError('');
        }}
        style={styles.toggleButton}
        disabled={isLoading}
      >
        <Ionicons
          name={isCreate ? 'key-outline' : 'person-add-outline'}
          size={16}
          color={theme.colors.textMuted}
        />
        <Text style={styles.toggleText}>
          {isCreate ? 'Import existing keys' : 'Create new account'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: theme.radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    marginBottom: theme.spacing.lg,
  },
  input: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textPrimary,
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radii.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    minHeight: 48,
  },
  inputMultiline: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.danger,
    marginBottom: theme.spacing.md,
  },
  submitButton: {
    backgroundColor: theme.colors.textPrimary,
    borderRadius: theme.radii.lg,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  submitButtonDisabled: {
    opacity: 0.4,
  },
  submitButtonText: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    color: theme.colors.background,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  toggleText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textMuted,
  },
}));
