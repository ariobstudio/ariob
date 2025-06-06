import { useWho } from '@ariob/core';
import React from 'react';
import { Navigate } from 'react-router';

interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({
  children,
  redirectTo = '/dashboard',
}) => {
  const { isAuthenticated, isLoading } = useWho();

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <view className="flex justify-center items-center h-full">
        <text>Loading...</text>
      </view>
    );
  }

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Render public content for unauthenticated users
  return <>{children}</>;
};
