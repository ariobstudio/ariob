import { useAuth } from '@ariob/core';
import React, { useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router';

export const HomePage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  if (!isLoading) {
    console.log('isnt loading', !isLoading); 
    if (isAuthenticated) {
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
