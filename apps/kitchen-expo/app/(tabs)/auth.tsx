import React, { useState } from 'react';
import { StyleSheet, ScrollView, TextInput, Pressable, View, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TestLogger, useTestLogger } from '@/components/test-logger';
import {
  create,
  auth,
  leave,
  recall,
  useAuth,
  authStore,
} from '@ariob/core';

// Helper function to format error details for alerts
function formatError(error: any): string {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object') {
    return JSON.stringify(error, null, 2);
  }
  return String(error);
}

export default function AuthTestScreen() {
  const logger = useTestLogger();
  const authState = useAuth();

  const [username, setUsername] = useState('testuser');
  const [password, setPassword] = useState('testpass123');
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    logger.info('Auth Test Screen mounted');
    logger.info('Initial auth state', {
      isAuthenticated: authState.isAuthenticated,
      user: authState.user?.alias
    });

    // Test recall on mount
    testRecall();
  }, []);

  // Watch for auth state changes
  React.useEffect(() => {
    if (authState.isAuthenticated) {
      logger.success('User authenticated', { alias: authState.user?.alias });
    } else {
      logger.info('User not authenticated');
    }
  }, [authState.isAuthenticated]);

  const testRecall = async () => {
    try {
      logger.info('🔄 Testing recall() - auto-login from storage');
      const result = await recall();

      if (result.ok) {
        logger.success('Recall successful', { alias: result.value?.alias });
      } else {
        logger.info('No stored session found');
      }
    } catch (error: any) {
      logger.error('Recall failed', error.message);
      Alert.alert('Recall Failed', formatError(error));
    }
  };

  const handleCreateAccount = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      logger.info('📝 Creating new account...', { username });
      const result = await create(username, password);

      if (result.ok) {
        logger.success('Account created successfully!', {
          alias: result.value.alias,
          pub: result.value.pub?.substring(0, 20) + '...',
        });

        // Check if auth store updated
        const storeState = authStore.getState();
        logger.info('Auth store state after creation', {
          isAuthenticated: storeState.isAuthenticated,
          alias: storeState.user?.alias,
        });
      } else {
        logger.error('Failed to create account', result.error);
        Alert.alert(
          'Create Account Failed',
          formatError(result.error) || 'Unknown error'
        );
      }
    } catch (error: any) {
      logger.error('Account creation error', error.message);
      Alert.alert('Create Account Error', formatError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      logger.info('🔐 Logging in...', { username });
      const result = await auth(username, password);

      if (result.ok) {
        logger.success('Login successful!', {
          alias: result.value.alias,
          pub: result.value.pub?.substring(0, 20) + '...',
        });

        // Check if auth store updated
        const storeState = authStore.getState();
        logger.info('Auth store state after login', {
          isAuthenticated: storeState.isAuthenticated,
          alias: storeState.user?.alias,
        });
      } else {
        logger.error('Login failed', result.error);
        Alert.alert('Login Failed', formatError(result.error) || 'Unknown error');
      }
    } catch (error: any) {
      logger.error('Login error', error.message);
      Alert.alert('Login Error', formatError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      logger.info('🚪 Logging out...');
      leave();
      logger.success('Logout successful');

      // Check if auth store updated
      const storeState = authStore.getState();
      logger.info('Auth store state after logout', {
        isAuthenticated: storeState.isAuthenticated,
        user: storeState.user,
      });
    } catch (error: any) {
      logger.error('Logout error', error.message);
      Alert.alert('Logout Error', formatError(error));
    }
  };

  const testAuthFlow = async () => {
    if (isLoading) return;
    setIsLoading(true);
    logger.info('🧪 Starting complete auth flow test...');

    try {
      // Step 1: Logout if already logged in
      logger.info('Step 1: Ensuring clean state...');
      leave();

      // Step 2: Create account
      logger.info('Step 2: Creating new account...');
      const createResult = await create(username + Date.now(), password);
      if (!createResult.ok) {
        throw new Error('Failed to create account: ' + createResult.error);
      }
      logger.success('Account created', { alias: createResult.value.alias });

      // Step 3: Logout
      logger.info('Step 3: Logging out...');
      leave();
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 4: Login
      logger.info('Step 4: Logging back in...');
      const loginResult = await auth(createResult.value.alias!, password);
      if (!loginResult.ok) {
        throw new Error('Failed to login: ' + loginResult.error);
      }
      logger.success('Login successful', { alias: loginResult.value.alias });

      // Step 5: Test recall
      logger.info('Step 5: Testing recall after login...');
      leave();
      await new Promise(resolve => setTimeout(resolve, 500));
      const recallResult = await recall();
      if (recallResult.ok) {
        logger.success('Recall successful', { alias: recallResult.value?.alias });
      } else {
        logger.warn('Recall did not restore session');
      }

      logger.success('✅ Complete auth flow test passed!');
    } catch (error: any) {
      logger.error('Auth flow test failed', error.message);
      Alert.alert('Auth Flow Test Failed', formatError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const inspectAuthStore = () => {
    const state = authStore.getState();
    logger.info('📊 Auth Store Inspection', {
      isAuthenticated: state.isAuthenticated,
      user: state.user ? {
        alias: state.user.alias,
        pub: state.user.pub?.substring(0, 30) + '...',
        epub: state.user.epub?.substring(0, 30) + '...',
      } : null,
    });
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Auth API Test</ThemedText>
        <ThemedText style={styles.subtitle}>
          Test authentication: createAccount, login, logout, recall
        </ThemedText>
      </ThemedView>

      {/* Current Auth State */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Current State (useAuth)</ThemedText>
        <ThemedView style={styles.stateCard}>
          <ThemedText style={styles.stateLabel}>Authenticated:</ThemedText>
          <ThemedText style={authState.isAuthenticated ? styles.stateYes : styles.stateNo}>
            {authState.isAuthenticated ? 'YES' : 'NO'}
          </ThemedText>
          {authState.user && (
            <>
              <ThemedText style={styles.stateLabel}>User:</ThemedText>
              <ThemedText style={styles.stateValue}>{authState.user.alias}</ThemedText>
              <ThemedText style={styles.stateLabel}>Public Key:</ThemedText>
              <ThemedText style={styles.stateMono}>
                {authState.user.pub?.substring(0, 30)}...
              </ThemedText>
            </>
          )}
        </ThemedView>
      </ThemedView>

      {/* Input Section */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Credentials</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />
      </ThemedView>

      {/* Action Buttons */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Actions</ThemedText>

        <Pressable
          style={[styles.button, styles.buttonPrimary, isLoading && styles.buttonDisabled]}
          onPress={handleCreateAccount}
          disabled={isLoading}
        >
          <ThemedText style={styles.buttonText}>
            {isLoading ? 'Loading...' : 'Create Account'}
          </ThemedText>
        </Pressable>

        <Pressable
          style={[styles.button, styles.buttonSecondary, isLoading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          <ThemedText style={styles.buttonText}>Login</ThemedText>
        </Pressable>

        <Pressable
          style={[styles.button, styles.buttonDanger]}
          onPress={handleLogout}
        >
          <ThemedText style={styles.buttonText}>Logout</ThemedText>
        </Pressable>

        <Pressable
          style={[styles.button, styles.buttonInfo]}
          onPress={testRecall}
        >
          <ThemedText style={styles.buttonText}>Test Recall</ThemedText>
        </Pressable>

        <Pressable
          style={[styles.button, styles.buttonSuccess, isLoading && styles.buttonDisabled]}
          onPress={testAuthFlow}
          disabled={isLoading}
        >
          <ThemedText style={styles.buttonText}>
            {isLoading ? 'Running...' : 'Run Complete Flow Test'}
          </ThemedText>
        </Pressable>

        <Pressable
          style={[styles.button, styles.buttonOutline]}
          onPress={inspectAuthStore}
        >
          <ThemedText style={styles.buttonTextOutline}>Inspect Auth Store</ThemedText>
        </Pressable>

        <Pressable
          style={[styles.button, styles.buttonOutline]}
          onPress={logger.clear}
        >
          <ThemedText style={styles.buttonTextOutline}>Clear Logs</ThemedText>
        </Pressable>
      </ThemedView>

      {/* Logger */}
      <TestLogger logs={logger.logs} maxHeight={500} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginTop: 40,
    marginBottom: 20,
  },
  subtitle: {
    marginTop: 8,
    opacity: 0.7,
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  stateCard: {
    marginTop: 12,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    gap: 8,
  },
  stateLabel: {
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.7,
  },
  stateValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  stateMono: {
    fontSize: 11,
    fontFamily: 'monospace',
    opacity: 0.8,
  },
  stateYes: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4caf50',
  },
  stateNo: {
    fontSize: 16,
    fontWeight: '700',
    color: '#999',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginTop: 8,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  button: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  buttonPrimary: {
    backgroundColor: '#007AFF',
  },
  buttonSecondary: {
    backgroundColor: '#5856D6',
  },
  buttonDanger: {
    backgroundColor: '#FF3B30',
  },
  buttonInfo: {
    backgroundColor: '#5AC8FA',
  },
  buttonSuccess: {
    backgroundColor: '#34C759',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextOutline: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
