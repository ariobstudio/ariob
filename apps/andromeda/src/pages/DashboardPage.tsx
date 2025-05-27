import { useAuth } from '@ariob/core';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BaseLayout } from '@/layouts/BaseLayout';

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <BaseLayout showHeader={false}>
      <view className="flex flex-col items-center justify-center min-h-screen p-6 space-y-8">
        <view className="text-center space-y-4">
          <text className="text-4xl font-bold text-foreground">
            ♛ Ariob Dashboard
          </text>
          <text className="text-xl text-muted-foreground">
            Welcome to your decentralized space
          </text>
        </view>

        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>
              Your decentralized identity details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <view className="space-y-2">
              <text className="text-sm font-medium">Username</text>
              <text className="text-base text-muted-foreground">
                {user?.alias || 'Unknown'}
              </text>
            </view>
            
            <view className="space-y-2">
              <text className="text-sm font-medium">Public Key</text>
              <text className="text-xs text-muted-foreground font-mono break-all">
                {user?.pub ? `${user.pub.slice(0, 20)}...` : 'Not available'}
              </text>
            </view>

            <Button
              className="w-full"
              variant="outline"
              bindtap={handleLogout}
            >
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </view>
    </BaseLayout>
  );
}; 