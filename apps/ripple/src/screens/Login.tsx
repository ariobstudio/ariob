/**
 * Login Screen
 *
 * Allows users to restore their account by entering their keypair.
 */

import { useState } from 'react';
import { Column, Text, Button, Input, Icon } from '@ariob/ui';
import { PageLayout } from '../components/Layout';
import type { IGunChainReference } from '@ariob/core';
import { useAuth } from '@ariob/core';

interface LoginProps {
  graph: IGunChainReference;
  onBack: () => void;
  onSuccess: () => void;
}

export function Login({ graph, onBack, onSuccess }: LoginProps) {
  const { login } = useAuth(graph);

  const [keysInput, setKeysInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    'background only';
    if (!keysInput.trim()) {
      setError('Please enter your keys');
      return;
    }

    console.log('>>>>> [Login] ========== LOGIN ATTEMPT ==========');
    console.log('>>>>> [Login] Keys input length:', keysInput.length);

    setLoading(true);
    setError('');

    try {
      // Parse the keypair JSON
      console.log('>>>>> [Login] Parsing keypair JSON...');
      const keys = JSON.parse(keysInput);

      console.log('>>>>> [Login] JSON parsed successfully');
      console.log('>>>>> [Login] Keys object keys:', Object.keys(keys));
      console.log('>>>>> [Login] Public key:', keys.pub ? keys.pub.substring(0, 50) + '...' : 'MISSING');

      // Validate required fields
      if (!keys.pub || !keys.priv || !keys.epub || !keys.epriv) {
        console.log('>>>>> [Login] ❌ Validation FAILED - missing required fields');
        console.log('>>>>> [Login]   Has pub:', !!keys.pub);
        console.log('>>>>> [Login]   Has priv:', !!keys.priv);
        console.log('>>>>> [Login]   Has epub:', !!keys.epub);
        console.log('>>>>> [Login]   Has epriv:', !!keys.epriv);
        console.log('>>>>> [Login] =================================================');
        throw new Error('Invalid keypair format. Missing required fields.');
      }

      console.log('>>>>> [Login] ✅ Keypair validation passed');
      console.log('>>>>> [Login] Calling login()...');

      // Login with keypair
      const result = await login(keys);

      console.log('>>>>> [Login] Login result:', result.ok ? 'SUCCESS ✅' : 'FAILED ❌');

      if (result.ok) {
        console.log('>>>>> [Login] ✅ Login successful');
        console.log('>>>>> [Login] User pub:', result.value.pub ? result.value.pub.substring(0, 50) + '...' : 'N/A');
        console.log('>>>>> [Login] Calling onSuccess()...');
        console.log('>>>>> [Login] =================================================');
        onSuccess();
      } else {
        console.log('>>>>> [Login] ❌ Login FAILED');
        console.log('>>>>> [Login] Error:', result.error.message);
        console.log('>>>>> [Login] =================================================');
        setError(result.error.message);
      }
    } catch (err) {
      console.log('>>>>> [Login] ❌ EXCEPTION during login');
      console.log('>>>>> [Login] Error:', err instanceof Error ? err.message : String(err));
      console.log('>>>>> [Login] =================================================');
      setError(err instanceof Error ? err.message : 'Invalid keypair JSON');
    }

    setLoading(false);
  };

  return (
    <PageLayout>
      {/* Top Header with Back Button */}
      <view className="w-full px-4 py-3 border-b border-border">
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
    </PageLayout>
  );
}
