import { useAuth } from '@ariob/core';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';

import { BaseLayout } from '@/layouts/BaseLayout';
import { SimpleAuth } from '@/pages/auth/SimpleAuth';
import { Column } from '@/components/primitives';

export const OnboardingPage = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

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
      <view className="flex flex-col items-center justify-center min-h-screen p-6 space-y-8">
        {/* Hero Section */}
        <Column spacing="md" align="center" className="pb-4">
          <text className="text-4xl font-bold text-foreground">
            ♛ Ariob
          </text>
          <text className="text-xl text-muted-foreground">
            Decentralized Authentication Demo
          </text>
        </Column>

        {/* Auth Component */}
        <SimpleAuth />
      </view>
    </BaseLayout>
  );
}; 