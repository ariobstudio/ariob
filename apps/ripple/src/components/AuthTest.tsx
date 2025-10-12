/**
 * AuthTest Component
 *
 * Demonstrates the authentication flow using the new Graph API
 * - Create account
 * - Login with keys
 * - View user info
 * - Logout
 */

import { useState } from 'react';
import { createGraph, useAuth, useKeys, Result } from '@ariob/core';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@ariob/ui';
import { Button } from '@ariob/ui';
import { Column, Row, Text } from '@ariob/ui';
import { Input } from '@ariob/ui';

// Create graph instance
const graph = createGraph({
  peers: ['wss://localhost:8765/gun'],
  localStorage: false
});

export function AuthTest() {
  const { user, isLoggedIn, login, create, logout } = useAuth(graph);
  const keys = useKeys();

  // Form state
  const [alias, setAlias] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [isSignupMode, setIsSignupMode] = useState(true);
  const [operationError, setOperationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Handle signup
  const handleSignup = async () => {
    if (!alias || !passphrase) {
      setOperationError('Please enter both alias and passphrase');
      return;
    }

    setOperationError(null);
    setSuccessMessage(null);

    const result = await Result.fromAsync(async () => {
      await create(alias, passphrase);
      return alias;
    });

    Result.match(result, {
      ok: (username) => {
        setSuccessMessage(`Welcome, ${username}! Account created successfully.`);
        setAlias('');
        setPassphrase('');
      },
      error: (error) => {
        setOperationError(error.message || 'Signup failed. User may already exist.');
      }
    });
  };

  // Handle login
  const handleLogin = async () => {
    if (!alias || !passphrase) {
      setOperationError('Please enter both alias and passphrase');
      return;
    }

    setOperationError(null);
    setSuccessMessage(null);

    const result = await Result.fromAsync(async () => {
      await login(alias, passphrase);
      return alias;
    });

    Result.match(result, {
      ok: (username) => {
        setSuccessMessage(`Welcome back, ${username}!`);
        setAlias('');
        setPassphrase('');
      },
      error: (error) => {
        setOperationError(error.message || 'Login failed. Please check your credentials.');
      }
    });
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    setSuccessMessage('Logged out successfully');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <Column spacing="md" className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Test</CardTitle>
          <CardDescription>
            Testing user signup, login, and logout with the new Graph API
          </CardDescription>
        </CardHeader>
      </Card>

      {operationError && (
        <Card>
          <CardContent>
            <Text variant="destructive">{operationError}</Text>
          </CardContent>
        </Card>
      )}

      {successMessage && (
        <Card>
          <CardContent>
            <Text className="text-green-600">{successMessage}</Text>
          </CardContent>
        </Card>
      )}

      {!isLoggedIn ? (
        <Card>
          <CardContent>
            <Column spacing="lg">
              <Column spacing="xs">
                <Text weight="semibold" size="sm">
                  {isSignupMode ? 'Create Account' : 'Login'}
                </Text>
                <Text variant="muted" size="xs">
                  {isSignupMode
                    ? 'Sign up for a new account'
                    : 'Login to your existing account'}
                </Text>
              </Column>

              <Column spacing="sm">
                <Column spacing="xs">
                  <Text size="sm">Alias</Text>
                  <Input
                    value={alias}
                    onChange={setAlias}
                    placeholder="Enter your alias"
                  />
                </Column>

                <Column spacing="xs">
                  <Text size="sm">Passphrase</Text>
                  <Input
                    value={passphrase}
                    onChange={setPassphrase}
                    placeholder="Enter your passphrase"
                    type="password"
                  />
                </Column>
              </Column>

              <Row spacing="sm" width="full">
                <Button
                  onClick={isSignupMode ? handleSignup : handleLogin}
                  className="flex-1"
                >
                  {isSignupMode ? 'Sign Up' : 'Login'}
                </Button>
                <Button
                  onClick={() => {
                    setIsSignupMode(!isSignupMode);
                    setOperationError(null);
                    setSuccessMessage(null);
                  }}
                  variant="secondary"
                  className="flex-1"
                >
                  {isSignupMode ? 'Switch to Login' : 'Switch to Sign Up'}
                </Button>
              </Row>

              {keys && (
                <Card>
                  <CardContent>
                    <Column spacing="xs">
                      <Text weight="semibold" size="xs">
                        Generated Key Pair
                      </Text>
                      <Text variant="muted" size="xs" className="truncate">
                        Public Key: {keys.pub.substring(0, 30)}...
                      </Text>
                      <Text variant="muted" size="xs">
                        Keys are generated automatically and securely stored
                      </Text>
                    </Column>
                  </CardContent>
                </Card>
              )}
            </Column>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Current User</CardTitle>
            </CardHeader>
            <CardContent>
              <Column spacing="sm">
                <Row spacing="xs">
                  <Text weight="semibold" size="sm">
                    Alias:
                  </Text>
                  <Text size="sm">{user?.alias || 'N/A'}</Text>
                </Row>
                <Row spacing="xs">
                  <Text weight="semibold" size="sm">
                    Public Key:
                  </Text>
                  <Text size="xs" variant="muted" className="truncate">
                    {keys?.pub ? `${keys.pub.substring(0, 20)}...` : 'N/A'}
                  </Text>
                </Row>
                <Row spacing="xs">
                  <Text weight="semibold" size="sm">
                    Status:
                  </Text>
                  <Text size="sm" className="text-green-600">
                    ✓ Authenticated
                  </Text>
                </Row>
              </Column>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Button onClick={handleLogout} variant="destructive" className="w-full">
                Logout
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      <Card>
        <CardHeader>
          <CardTitle>How it works</CardTitle>
        </CardHeader>
        <CardContent>
          <Column spacing="xs">
            <Text variant="muted" size="sm">
              • Uses createGraph() to initialize Gun instance
            </Text>
            <Text variant="muted" size="sm">
              • useAuth() hook for authentication management
            </Text>
            <Text variant="muted" size="sm">
              • useKeys() hook for automatic key pair generation
            </Text>
            <Text variant="muted" size="sm">
              • Traditional method (alias + passphrase)
            </Text>
            <Text variant="muted" size="sm">
              • Credentials stored securely with Gun SEA
            </Text>
          </Column>
        </CardContent>
      </Card>
    </Column>
  );
}
