import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { create } from '@ariob/core';
import { router } from 'expo-router';

export default function Onboarding() {
  const [alias, setAlias] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAnchor = async () => {
    if (!alias.trim()) return;
    setLoading(true);
    
    try {
        const result = await create(alias);
        
        if (result.ok) {
            setLoading(false);
            router.replace('/');
        } else {
            console.error('Auth failed:', result.error);
            setLoading(false);
        }
    } catch (e) {
        console.error('Unexpected auth error:', e);
        setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <View style={styles.header}>
            <Text style={styles.subtitle}>SYSTEM INITIALIZATION</Text>
            <Pressable onPress={() => router.back()}>
                <Text style={styles.closeIcon}>✕</Text>
            </Pressable>
        </View>

        <View style={styles.main}>
            <Text style={styles.title}>Anchor Identity</Text>
            <Text style={styles.description}>
                Generate a cryptographic keypair to sign your nodes in the graph. 
                This happens locally on your device.
            </Text>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Choose a handle..."
                    placeholderTextColor="#536471"
                    value={alias}
                    onChangeText={setAlias}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoFocus
                />
            </View>
        </View>

        <View style={styles.footer}>
            <Pressable 
                style={[styles.button, !alias && styles.buttonDisabled]} 
                onPress={handleAnchor}
                disabled={!alias || loading}
            >
                {loading ? (
                    <ActivityIndicator size="large" color="#000" />
                ) : (
                    <Text style={styles.buttonIcon}>→</Text>
                )}
            </Pressable>
            <Text style={styles.helperText}>
                {loading ? 'Generating Keys...' : 'Swipe down to cancel'}
            </Text>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end' as const,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    padding: 32,
    justifyContent: 'space-between' as const,
  },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginTop: 32,
  },
  subtitle: {
    fontSize: 10,
    fontWeight: 'bold' as const,
    letterSpacing: 2,
    color: '#536471',
    fontFamily: 'monospace',
  },
  closeIcon: {
    fontSize: 24,
    color: '#71767B',
  },
  main: {
    flex: 1,
    justifyContent: 'center' as const,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    color: '#E7E9EA',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#71767B',
    lineHeight: 24,
    marginBottom: 32,
  },
  inputContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#2F3336',
    paddingVertical: 16,
  },
  input: {
    fontSize: 24,
    color: '#E7E9EA',
    fontWeight: '600' as const,
  },
  footer: {
    alignItems: 'center' as const,
    marginBottom: 32,
    gap: 16,
  },
  button: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E7E9EA',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  buttonDisabled: {
    opacity: 0.3,
  },
  buttonIcon: {
    fontSize: 32,
    color: '#000',
    fontWeight: 'bold' as const,
  },
  helperText: {
    fontSize: 12,
    color: '#536471',
  }
});
