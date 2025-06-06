import { useWho } from '@ariob/core';
import React, { useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router';

export const HomePage: React.FC = () => {
  const { isAuthenticated, isLoading } = useWho();
  const navigate = useNavigate();
  console.log('isAuthenticated', isAuthenticated);
  console.log('isLoading', isLoading);
  if (!isLoading) {
    if (isAuthenticated) {
      console.log('navigating to dashboard');
      navigate('/dashboard');
    } else {
      navigate('/onboarding');
    }
  }

  // Show loading state while determining redirect
  if (isLoading) {
    return (
      <page className="flex items-center justify-center h-full bg-background">
        <view className="text-center">
          <text className="text-lg text-muted-foreground">Loading...</text>
        </view>
      </page>
    );
  }

  // Return null while redirecting
  return null;
};
