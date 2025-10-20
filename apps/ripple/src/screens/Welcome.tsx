/**
 * Welcome Screen
 *
 * Entry point for unauthenticated users.
 * Choose between creating a new account or logging in.
 */

import { Column, Text, Button, useTheme, cn } from '@ariob/ui';
import illustrationLight from '../assets/illustration-light.png';
import illustrationDark from '../assets/illustration-dark.png';

interface WelcomeProps {
  onCreateAccount: () => void;
  onLogin: () => void;
}

export function Welcome({ onCreateAccount, onLogin }: WelcomeProps) {
  const { theme, withTheme } = useTheme();

  return (
    <page className={
      cn(withTheme('', 'dark'), "bg-background w-full h-full pb-safe-bottom pt-safe-top")}>
      <Column className="w-full h-full p-8 justify-around items-center" spacing="xl">
        {/* Illustration */}
        <image
          src={theme === 'dark' ? illustrationDark : illustrationLight}
          className="w-64 h-64"
        />

        {/* App branding */}
        <Column spacing="none" className="items-center text-center">
          <Text size="4xl" weight="bold" className="text-primary">
          Own Your Identity
          </Text>

          <Text variant="muted">
          Your data is yours. No central authority. 
          </Text>
          <Text variant="muted">
          No censorship. Just you and your friends.
          </Text>
        </Column>

        {/* Action buttons */}
        <Column spacing="md" className="w-full max-w-sm mt-16">
          <Button
            onTap={() => {
              'background only';
              onCreateAccount();
            }}
            size="lg"
          >
            Create a New Key
          </Button>

          <Button
            onTap={() => {
              'background only';
              onLogin();
            }}
            variant="outline"
            size="lg"
          >
            Add an Existing Key
          </Button>
        </Column>

        <Text variant="muted" size="xs" className="text-center max-w-sm mt-8">
          By using Ariob, you agree to our
          <Text variant="primary" size="xs" weight={"bold"}> Terms of Use </Text>and
          <Text variant="primary" size="xs" weight={"bold"}> Privacy Policy </Text>
        </Text>
      </Column>
    </page>
  );
}
