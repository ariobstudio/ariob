/**
 * Import Keys Screen
 *
 * Allows users to import existing keypair to restore their account
 */

import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '@ariob/core';
import { theme } from '../theme';

export default function ImportKeysScreen() {
  const router = useRouter();
  const [keysJson, setKeysJson] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState('');

  const handleBack = () => {
    router.back();
  };

  const handleImport = async () => {
    if (!keysJson.trim()) {
      setError('Please paste your keys');
      return;
    }

    setIsImporting(true);
    setError('');

    try {
      // Parse the keypair JSON
      const keys = JSON.parse(keysJson.trim());

      // Validate keypair structure
      if (!keys.pub || !keys.priv || !keys.epub || !keys.epriv) {
        throw new Error('Invalid keypair format. Keys must include pub, priv, epub, and epriv fields.');
      }

      console.log('[Import] Importing keypair...');

      // Authenticate with the keypair
      const result = await auth(keys);

      if (!result.ok) {
        console.error('[Import] Auth failed:', result.error);
        setError(result.error?.message || 'Failed to import keys');
        setIsImporting(false);
        return;
      }

      console.log('[Import] ✓ Keys imported successfully:', result.value);

      // Save keypair to AsyncStorage for future authentication
      await AsyncStorage.setItem('userKeys', keysJson.trim());
      console.log('[Import] ✓ Keys saved to AsyncStorage');

      // Mark onboarding as complete
      await AsyncStorage.setItem('hasOnboarded', 'true');

      // Navigate to main app
      router.replace('/(tabs)');
    } catch (err) {
      console.error('[Import] Error:', err);
      if (err instanceof SyntaxError) {
        setError('Invalid JSON format. Please check your keys and try again.');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to import keys. Please try again.');
      }
      setIsImporting(false);
    }
  };

  const handlePasteExample = () => {
    // Example keypair for testing
    const exampleKeys = {
      pub: 'example_public_key',
      priv: 'example_private_key',
      epub: 'example_encryption_public_key',
      epriv: 'example_encryption_private_key',
    };
    setKeysJson(JSON.stringify(exampleKeys, null, 2));
    Alert.alert(
      'Example Keys',
      'These are example keys for demonstration. In production, paste your actual exported keys here.',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Import Keys</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Restore Your Account</Text>
          <Text style={styles.subtitle}>
            Paste your exported keypair (JSON format) to restore access to your account.
          </Text>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color={theme.colors.text} />
            <Text style={styles.infoText}>
              Your keys should be in JSON format with pub, priv, epub, and epriv fields.
            </Text>
          </View>

          <TextInput
            style={styles.keysInput}
            value={keysJson}
            onChangeText={(text) => {
              setKeysJson(text);
              setError('');
            }}
            placeholder='{"pub": "...", "priv": "...", "epub": "...", "epriv": "..."}'
            placeholderTextColor={theme.colors.textTertiary}
            multiline
            numberOfLines={10}
            textAlignVertical="top"
            editable={!isImporting}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Pressable style={styles.exampleButton} onPress={handlePasteExample}>
            <Text style={styles.exampleButtonText}>Paste Example Keys</Text>
          </Pressable>

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={20} color="#FF3B30" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Pressable
            style={[styles.importButton, (!keysJson.trim() || isImporting) && styles.buttonDisabled]}
            onPress={handleImport}
            disabled={!keysJson.trim() || isImporting}
          >
            {isImporting ? (
              <ActivityIndicator size="small" color={theme.colors.background} />
            ) : (
              <Text style={styles.importButtonText}>Import & Login</Text>
            )}
          </Pressable>

          <View style={styles.warningBox}>
            <Ionicons name="warning" size={20} color="#FF9500" />
            <Text style={styles.warningText}>
              Never share your private keys with anyone. If someone has access to your keys, they have full access to your account.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.colors.text,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.xxl,
    paddingTop: theme.spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 24,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
  },
  infoBox: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    backgroundColor: `${theme.colors.surface}80`,
    borderRadius: theme.radii.md,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: `${theme.colors.text}10`,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },
  keysInput: {
    fontSize: 13,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    minHeight: 180,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: theme.spacing.md,
  },
  exampleButton: {
    alignSelf: 'flex-start',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  exampleButtonText: {
    fontSize: 14,
    color: theme.colors.text,
    textDecorationLine: 'underline',
  },
  errorBox: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    backgroundColor: `${theme.colors.surface}80`,
    borderRadius: theme.radii.md,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: '#FF3B3040',
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#FF3B30',
    lineHeight: 20,
  },
  importButton: {
    backgroundColor: theme.colors.text,
    borderRadius: theme.radii.lg,
    paddingVertical: theme.spacing.md + 2,
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  importButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.colors.background,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  warningBox: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    backgroundColor: `${theme.colors.surface}80`,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: '#FF950040',
    marginBottom: theme.spacing.xxl,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
});
