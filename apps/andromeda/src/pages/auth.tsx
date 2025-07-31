import { Column, Row } from '@/components/primitives';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useWho } from '@ariob/core';
import React, { useState } from 'react';
import crypto from 'crypto';

const Page: React.FC = () => {
  const { signup, login, isLoading, error } = useWho();
  const [alias, setAlias] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [mnemonic, setMnemonic] = useState('');
  const [authMethod, setAuthMethod] = useState<
    'keypair' | 'mnemonic' | 'traditional'
  >('keypair');
  const [isSignup, setIsSignup] = useState(true);

  const showCrypto = () => {
    console.log(crypto);
  }
  const handleAuth = async () => {
    if (!alias.trim()) {
      alert('Please enter an alias');
      return;
    }

    const authFn = isSignup ? signup : login;
    let result;

    switch (authMethod) {
      case 'keypair':
        result = await authFn({
          method: 'keypair',
          alias,
        });
        break;

      case 'mnemonic':
        if (!isSignup && !mnemonic.trim()) {
          alert('Please enter your mnemonic phrase');
          return;
        }
        result = await authFn({
          method: 'mnemonic',
          alias,
          mnemonic: mnemonic || undefined,
          passphrase: passphrase || undefined,
        });
        break;

      case 'traditional':
        if (!passphrase.trim()) {
          alert('Please enter a password');
          return;
        }
        result = await authFn({
          method: 'traditional',
          alias,
          passphrase,
        });
        break;
    }

    result?.match(
      (user) => {
        console.log('Authentication successful:', user.alias);
      },
      (error) => {
        console.error('Authentication error:', error);
      },
    );
  };

  return (
    <view className="flex flex-col items-center justify-center min-h-screen p-6 space-y-8">

    <Column
      height="full"
      justify="center"
      align="center"
      className="p-6"
    >
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl text-center">
            {isSignup ? 'Create Account' : 'Login'}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Column spacing="md">
            {/* Auth Method Selector */}
            <Column spacing="xs">
              <text className="text-sm font-medium text-gray-700">
                Authentication Method
              </text>
              <Row spacing="xs">
                {(['keypair', 'mnemonic', 'traditional'] as const).map(
                  (method) => (
                    <Button
                      key={method}
                      variant={authMethod === method ? 'default' : 'outline'}
                      onClick={() => setAuthMethod(method)}
                    >
                      {method.charAt(0).toUpperCase() + method.slice(1)}
                    </Button>
                  ),
                )}
              </Row>
            </Column>

            {/* Alias Input */}
            <Column spacing="xs">
              <text className="text-sm font-medium text-gray-700">Alias</text>
              <Input
                value={alias}
                // @ts-ignore - Using framework-specific bindinput
                bindinput={(e: any) => setAlias(e.detail.value)}
                placeholder="Enter your alias"
              />
            </Column>

            {/* Method-specific inputs */}
            {authMethod === 'mnemonic' && !isSignup && (
              <Column spacing="xs">
                <text className="text-sm font-medium text-gray-700">
                  Mnemonic Phrase
                </text>
                <TextArea
                  value={mnemonic}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setMnemonic(e.target.value)
                  }
                  placeholder="Enter your 12 or 24 word mnemonic"
                  className="h-20"
                />
              </Column>
            )}

            {(authMethod === 'traditional' ||
              (authMethod === 'mnemonic' && passphrase)) && (
              <Column spacing="xs">
                <text className="text-sm font-medium text-gray-700">
                  {authMethod === 'traditional'
                    ? 'Password'
                    : 'Passphrase (Optional)'}
                </text>
                <Input
                  type="password"
                  value={passphrase}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setPassphrase(e.target.value)
                  }
                  placeholder={
                    authMethod === 'traditional'
                      ? 'Enter password'
                      : 'Optional extra security'
                  }
                />
              </Column>
            )}

            {/* Error Display */}
            {error && (
              <view className="p-3 bg-red-50 border border-red-200 rounded">
                <text className="text-red-700 text-sm">{error.message}</text>
              </view>
            )}

            {/* Submit Button */}
            <Button
              onClick={showCrypto}
              variant="default"
              size="lg"
            >
              {isLoading ? 'Processing...' : isSignup ? 'Sign Up' : 'Login'}
            </Button>

            {/* Toggle Signup/Login */}
            <Row justify="center" spacing="xs">
              <text className="text-sm text-gray-600">
                {isSignup
                  ? 'Already have an account? '
                  : "Don't have an account? "}
              </text>
              <text
                bindtap={() => setIsSignup(!isSignup)}
                className="text-sm text-blue-500 font-medium cursor-pointer"
              >
                {isSignup ? 'Login' : 'Sign Up'}
              </text>
            </Row>

            {/* Info Text */}
            <view className="p-3 bg-gray-50 rounded">
              <text className="text-xs text-gray-600 text-center">
                {authMethod === 'keypair' &&
                  'Secure keypair authentication. Keys are generated automatically.'}
                {authMethod === 'mnemonic' &&
                  'BIP39 mnemonic phrase. Save your phrase securely!'}
                {authMethod === 'traditional' &&
                  'Traditional username/password authentication.'}
              </text>
            </view>
          </Column>
        </CardContent>
      </Card>
    </Column>
    </view>

  );
};

export default Page;
