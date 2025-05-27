import { useAuth } from '@ariob/core';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Column, Row } from '@/components/primitives';

export const SimpleAuth: React.FC = () => {
  const { login, signup, isLoading } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [alias, setAlias] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = async () => {
    if (!alias || !password || isLoading) return;
    console.log('alias', alias);
    console.log('password', password);
    try {
      if (isLoginMode) {
        await login(alias);
      } else {
        await signup(alias);
      }
    } catch (error) {
      console.error('Auth error:', error);
    }
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setAlias('');
    setPassword('');
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{isLoginMode ? 'Welcome Back' : 'Create Account'}</CardTitle>
        <CardDescription>
          {isLoginMode ? 'Sign in to your account' : 'Sign up for a new account'}
        </CardDescription>
      </CardHeader>
      <CardContent className='flex-col'>
        <Column spacing="md" align="center" className='pb-2'>
          <Row width='full'>
            <Input
              type="text"
              placeholder="Enter your username"
              value={alias}
              // @ts-ignore
              bindinput={(e) => setAlias(e.detail.value)}
              required
            />
          </Row>
          
          <Row width='full'>
            <Input
              type="password"
              placeholder="Enter your password"
              value={password}
              // @ts-ignore
              bindinput={(e) => setPassword(e.detail.value)}
              required
            />
          </Row>

          <Button
            className='w-auto'
            bindtap={handleAuth}
          >
            {isLoading ? 'Loading...' : (isLoginMode ? 'Sign In' : 'Sign Up')}
          </Button>
        </Column>

        <Row spacing="md" justify="center">
          <text className="text-sm text-muted-foreground">
            {isLoginMode ? "Don't have an account?" : 'Already have an account?'}
          </text>
          <Button
            variant="link"
            className="p-0 h-auto font-normal"
            bindtap={toggleMode}
          >
            {isLoginMode ? 'Sign up' : 'Sign in'}
          </Button>
        </Row>
      </CardContent>
    </Card>
  );
}; 