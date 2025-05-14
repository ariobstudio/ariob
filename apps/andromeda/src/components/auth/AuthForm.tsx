import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/gun/hooks/useAuth';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

interface ErrorAlertProps {
  error: string;
  errorType?: string | null;
}

const ErrorAlert = ({ error, errorType }: ErrorAlertProps) => {
  return (
    <Alert variant="destructive">
      <AlertTitle>{errorType || 'Error'}</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
};

export const AuthForm: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [alias, setAlias] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [localErrorType, setLocalErrorType] = useState<string | null>(null);

  const { user, isLoading, error, errorType, isAuthenticated, signup, login, logout } = useAuth();

  const handleInput = (e: any) => {
    const value = e.detail?.value ?? '';
    setAlias(value);
  };

  const handleSubmit = async () => {
    try {
      setLocalError(null);
      setLocalErrorType(null);
      
      if (isLogin) {
        // This assumes login expects a JSON string as keyPair
        const keyPair = alias; // In a real app, this should be properly handled
        await login(keyPair);
      } else {
        await signup(alias);
      }
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Unknown error');
      setLocalErrorType('UNKNOWN_ERROR');
      console.error('Auth error:', err);
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{isLogin ? 'Login' : 'Sign Up'}</CardTitle>
        <CardDescription>
          {isLogin ? 'Login to your account.' : 'Create a new account.'}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {/* Using the Input component with proper props */}
        <Input
          id="alias"
          placeholder="Username"
          /* @ts-ignore - bindinput is a custom prop for this framework */
          bindinput={handleInput}
          minLength={3}
          required
        />

        {(error || localError) && (
          <ErrorAlert 
            error={error || localError || 'Unknown error'} 
            errorType={errorType || localErrorType}
          />
        )}
      </CardContent>

      <CardFooter className="flex justify-between items-center">
        <Button
          variant="link"
          size="sm"
          /* @ts-ignore - bindtap is a custom prop for this framework */
          bindtap={() => setIsLogin(!isLogin)}
          className={isLoading ? 'opacity-50 pointer-events-none' : ''}
        >
          {isLogin ? 'Need an account? Sign Up' : 'Have an account? Login'}
        </Button>
        <Button
          icon={isLogin ? 'log-in' : 'arrow-right'}
          size="lg"
          /* @ts-ignore - bindtap is a custom prop for this framework */
          bindtap={handleSubmit}
          className={isLoading ? 'opacity-50 pointer-events-none' : ''}
        >
          {isLoading ? 'Processing…' : isLogin ? 'Login' : 'Sign Up'}
        </Button>
      </CardFooter>
    </Card>
  );
};
