/**
 * AuthTest Component
 *
 * Demonstrates the authentication flow using useWho hook
 * - Sign up
 * - Login
 * - View profile
 * - Update profile
 * - Logout
 */

import { useState } from 'react';
import { useWho } from '@ariob/core';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@ariob/ui';
import { Button } from '@ariob/ui';
import { Column, Row, Text } from '@ariob/ui';
import { Input } from '@ariob/ui';

export function AuthTest() {
  const { user, isLoading, error, signup, login, logout, isAuthenticated } = useWho();

  // Form state
  const [alias, setAlias] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isSignupMode, setIsSignupMode] = useState(true);

  // Handle signup
  const handleSignup = async () => {
    if (!alias || !passphrase) return;

    const result = await signup({
      method: 'traditional',
      alias,
      passphrase,
    });

    result.match(
      (user) => {
        console.log('Signup successful:', user);
        setAlias('');
        setPassphrase('');
      },
      (error) => {
        console.error('Signup failed:', error);
      }
    );
  };

  // Handle login
  const handleLogin = async () => {
    if (!alias || !passphrase) return;

    const result = await login({
      method: 'traditional',
      alias,
      passphrase,
    });

    result.match(
      (user) => {
        console.log('Login successful:', user);
        setAlias('');
        setPassphrase('');
      },
      (error) => {
        console.error('Login failed:', error);
      }
    );
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    setDisplayName('');
  };

  if (isLoading) {
    return (
      <Column spacing="md" className="p-4">
        <Text>Loading authentication...</Text>
      </Column>
    );
  }

  return (
    <Column spacing="md" className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Test</CardTitle>
          <CardDescription>
            Testing user signup, login, profile, and logout
          </CardDescription>
        </CardHeader>
      </Card>

      {error && (
        <Card>
          <CardContent>
            <Text variant="destructive">Error: {error.message}</Text>
          </CardContent>
        </Card>
      )}

      {!isAuthenticated ? (
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
                  onClick={() => setIsSignupMode(!isSignupMode)}
                  variant="secondary"
                  className="flex-1"
                >
                  {isSignupMode ? 'Switch to Login' : 'Switch to Sign Up'}
                </Button>
              </Row>
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
                  <Text size="sm">{user?.alias}</Text>
                </Row>
                <Row spacing="xs">
                  <Text weight="semibold" size="sm">
                    Public Key:
                  </Text>
                  <Text size="xs" variant="muted" className="truncate">
                    {user?.pub?.substring(0, 20)}...
                  </Text>
                </Row>
                {user?.displayName && (
                  <Row spacing="xs">
                    <Text weight="semibold" size="sm">
                      Display Name:
                    </Text>
                    <Text size="sm">{user.displayName}</Text>
                  </Row>
                )}
                <Row spacing="xs">
                  <Text weight="semibold" size="sm">
                    Created:
                  </Text>
                  <Text size="xs" variant="muted">
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleString()
                      : 'N/A'}
                  </Text>
                </Row>
              </Column>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profile Update</CardTitle>
              <CardDescription>Update your profile information</CardDescription>
            </CardHeader>
            <CardContent>
              <Column spacing="sm">
                <Column spacing="xs">
                  <Text size="sm">Display Name</Text>
                  <Input
                    value={displayName}
                    onChange={setDisplayName}
                    placeholder="Enter display name"
                  />
                </Column>
                <Button onClick={() => console.log('Update profile:', displayName)}>
                  Update Profile
                </Button>
                <Text variant="muted" size="xs">
                  Note: Profile update functionality to be implemented
                </Text>
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
              • Uses useWho() hook for authentication
            </Text>
            <Text variant="muted" size="sm">
              • Traditional method (alias + passphrase)
            </Text>
            <Text variant="muted" size="sm">
              • Stores credentials securely
            </Text>
            <Text variant="muted" size="sm">
              • Auto-restores session on reload
            </Text>
          </Column>
        </CardContent>
      </Card>
    </Column>
  );
}
