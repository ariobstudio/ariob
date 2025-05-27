import { Column } from '@/components/primitives';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import React from 'react';
import { useNavigate } from 'react-router';

export const NotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    console.log('handleGoHome');
    navigate('/');
  };

  const handleGoBack = () => {
    console.log('handleGoBack');
    navigate(-1);
  };

  return (
    <view className="flex justify-center items-center h-full p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-6xl font-bold text-muted-foreground">
            404
          </CardTitle>
          <text className="text-xl font-semibold">Page Not Found</text>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <text className="text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </text>
          <Column spacing="md" >
            <Button bindtap={handleGoHome} className="w-full">
              Go Home
            </Button>
            <Button bindtap={handleGoBack} variant="outline" className="w-full">
              Go Back
            </Button>
          </Column>
        </CardContent>
      </Card>
    </view>
  );
};
