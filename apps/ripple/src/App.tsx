import { useState, useEffect } from '@lynx-js/react';
import { graph, useAuth } from '@ariob/core';
import { Column, Text, useTheme } from '@ariob/ui';
import { Welcome } from './screens/Welcome';
import { CreateAccount } from './screens/CreateAccount';
import { Login } from './screens/Login';
import { Chat } from './screens/Chat';

type Screen = 'welcome' | 'create-account' | 'login' | 'chat';

export function App() {
  const g = graph();
  const { isLoggedIn, recall } = useAuth(g);
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Auto-login: Check for stored keys on mount
  useEffect(() => {
    'background only';
    const attemptAutoLogin = async () => {
      console.log('[App] Checking for stored session...');
      const result = await recall();

      if (result.ok) {
        console.log('[App] ✓ Auto-login successful');
        setCurrentScreen('chat');
      } else {
        console.log('[App] No stored session, showing welcome screen');
      }

      setIsCheckingAuth(false);
    };

    attemptAutoLogin();
  }, [recall]);

  // Navigate to chat when logged in
  const handleAuthSuccess = () => {
    'background only';
    setCurrentScreen('chat');
  };

  // Show loading state while checking for stored session
  const { withTheme } = useTheme();
  if (isCheckingAuth) {
    return (
      <page className={withTheme('bg-background w-full h-full', 'dark bg-background w-full h-full')}>
        <Column className="w-full h-full items-center justify-center" spacing="md">
          <Text variant="muted" size="sm">
            Loading...
          </Text>
        </Column>
      </page>
    );
  }

  // If logged in, show chat directly
  if (isLoggedIn) {
    return (
      <Chat
        onLogout={() => {
          'background only';
          setCurrentScreen('welcome');
        }}
      />
    );
  }

  // Otherwise, show onboarding flow
  switch (currentScreen) {
    case 'create-account':
      return (
        <CreateAccount
          onBack={() => {
            'background only';
            setCurrentScreen('welcome');
          }}
          onSuccess={handleAuthSuccess}
        />
      );

    case 'login':
      return (
        <Login
          onBack={() => {
            'background only';
            setCurrentScreen('welcome');
          }}
          onSuccess={handleAuthSuccess}
        />
      );

    case 'chat':
      return (
        <Chat
          onLogout={() => {
            'background only';
            setCurrentScreen('welcome');
          }}
        />
      );

    default:
      return (
        <Welcome
          onCreateAccount={() => {
            'background only';
            setCurrentScreen('create-account');
          }}
          onLogin={() => {
            'background only';
            setCurrentScreen('login');
          }}
        />
      );
  }
}
