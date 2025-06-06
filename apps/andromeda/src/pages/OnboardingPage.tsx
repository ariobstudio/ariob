import { useWho } from '@ariob/core';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';

import OnboardingDark from '@/assets/illustration-dark.png';
import OnboardingLight from '@/assets/illustration-light.png';
import { Column, Row } from '@/components/primitives';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import { BaseLayout } from '@/layouts/BaseLayout';
import { SimpleAuth } from '@/pages/auth/SimpleAuth';

export const OnboardingPage = () => {
  const { isAuthenticated, isLoading, signup } = useWho();
  const { withTheme, currentTheme, setTheme } = useTheme();
  const onboaringImage = withTheme(OnboardingLight, OnboardingDark);
  const navigate = useNavigate();

  const handleThemeToggle = () => {
    setTheme(currentTheme === 'Light' ? 'Dark' : 'Light');
  };

  if (!isLoading && isAuthenticated) {
    navigate('/dashboard', { replace: true });
  }

  if (isLoading) {
    return (
      <BaseLayout showHeader={false}>
        <view className="flex items-center justify-center h-full">
          <text className="text-lg text-muted-foreground">Loading...</text>
        </view>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout showHeader={false}>
      <view className="grid grid-rows-[1fr_auto] min-h-screen p-6 gap-8">
        {/* Main Content - Takes available space */}
        <view className="flex flex-col items-center justify-center overflow-auto">
          {/* Hero Section */}
          <Column spacing="lg" align="center" className="max-w-md mx-auto">
            <image
              src={onboaringImage}
              className="w-72 h-72"
              mode="aspectFit"
              bindtap={handleThemeToggle}
            />
            <Column align="center" spacing="sm">
              <text className="text-4xl font-bold text-foreground text-center">
                Own Your Identity
              </text>
              <Column align="center" spacing="none">
                <text className="text-lg text-muted-foreground text-center">
                  Your data is yours. No central authority.
                </text>
                <text className="text-lg text-muted-foreground text-center">
                  No censorship. Just you and your friends.
                </text>
              </Column>
            </Column>

            {/* Action Buttons */}
            <Column spacing="md" align="center" className="w-full mt-8">
              <Button
                icon="fingerprint"
                size="lg"
                className="w-full"
                bindtap={() => {
                  navigate('/login');
                }}
              >
                Create New Key
              </Button>
              <Button
                icon="upload"
                variant="outline"
                size="lg"
                className="w-full"
              >
                Import Existing Key
              </Button>
            </Column>
          </Column>
        </view>

        {/* Terms and Privacy - Always visible at bottom */}
        <text className="text-sm text-muted-foreground text-center leading-relaxed">
          By using Ariob, you agree to our{' '}
          <text className="font-semibold text-foreground cursor-pointer hover:underline">
            Terms of Use
          </text>{' '}
          and{' '}
          <text className="font-semibold text-foreground cursor-pointer hover:underline">
            Privacy Policy
          </text>
        </text>
      </view>
    </BaseLayout>
  );
};
