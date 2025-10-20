/**
 * Login Screen
 *
 * Allows users to restore their account by entering their keypair.
 */

import { useState } from 'react';
import { Column, Text, Button, Input, Icon, useTheme } from '@ariob/ui';
import { graph, useAuth } from '@ariob/core';

interface LoginProps {
  onBack: () => void;
  onSuccess: () => void;
}

export function Login({ onBack, onSuccess }: LoginProps) {
  const { withTheme } = useTheme();
  const g = graph();
  const { login } = useAuth(g);

  const [keysInput, setKeysInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    'background only';
    if (!keysInput.trim()) {
      setError('Please enter your keys');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Parse the keypair JSON
      const keys = JSON.parse(keysInput);

      // Validate required fields
      if (!keys.pub || !keys.priv || !keys.epub || !keys.epriv) {
        throw new Error('Invalid keypair format. Missing required fields.');
      }

      // Login with keypair
      const result = await login(keys);

      if (result.ok) {
        onSuccess();
      } else {
        setError(result.error.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid keypair JSON');
    }

    setLoading(false);
  };

  return (
    <page className={withTheme('bg-background w-full h-full', 'dark bg-background w-full h-full')}>
      {/* Top Header with Back Button */}
      <view className="w-full px-4 py-3 pt-safe-top border-b border-border">
        <Button
          onTap={() => {
            'background only';
            onBack();
          }}
          variant="ghost"
          size="sm"
          className="flex-row items-center gap-1 -ml-2"
        >
          <Icon name="arrow-left" size="sm" />
          <Text size="sm">Back</Text>
        </Button>
      </view>

      <Column className="flex-1 w-full items-center justify-center p-8" spacing="xl">
        {/* Header */}
        <Column spacing="md" className="items-center text-center">
          <Text size="3xl" weight="bold">
            Welcome Back
          </Text>
          <Text variant="muted" className="max-w-sm">
            Enter your keypair to restore your account
          </Text>
        </Column>

        {/* Keys input */}
        <Column spacing="md" className="w-full max-w-md">
          <view className="w-full">
            <Text size="sm" weight="medium" className="mb-2">
              Keypair JSON:
            </Text>
            <Input
              value={keysInput}
              onChange={(value) => {
                'background only';
                setKeysInput(value);
                setError('');
              }}
              placeholder='{"pub":"...","priv":"...","epub":"...","epriv":"..."}'
              className="w-full font-mono text-xs"
            />
          </view>

          {error && (
            <Text className="text-destructive" size="sm">
              {error}
            </Text>
          )}

          <Text variant="muted" size="xs">
            Paste your full keypair JSON. You received this when you created your account.
          </Text>

          <Button
            onTap={handleLogin}
            size="lg"
            className="w-full mt-4"
            disabled={loading || !keysInput.trim()}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </Column>
      </Column>
    </page>
  );
}
