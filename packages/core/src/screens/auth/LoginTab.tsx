import React, { useState } from 'react';
import { Input, Button } from '../../components';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../components/ThemeProvider';

export function LoginTab() {
  const [username, setUsername] = useState('');
  const [magicKey, setMagicKey] = useState('');
  const { login, isLoading, error } = useAuth();
  const { withTheme } = useTheme();

  const handleLogin = async () => {
    if (!username || !magicKey) return;
    await login(username, magicKey);
  };

  return (
    <view className="py-2">
      <text className={`mb-4 ${withTheme('text-gray-500', 'text-gray-400')}`}>
        Enter your username and magic key to login
      </text>
      
      <Input
        label="Username"
        placeholder="Your username"
        value={username}
        onChange={setUsername}
        variant="outlined"
        className="mb-4"
      />
      
      <Input
        label="Magic Key"
        placeholder="Your magic key"
        value={magicKey}
        onChange={setMagicKey}
        variant="outlined"
        className="mb-4"
      />
      
      {error && (
        <text className={`text-sm mb-3 ${withTheme('text-red-500', 'text-red-400')}`}>
          {error}
        </text>
      )}
      
      <Button 
        variant="primary"
        onPress={handleLogin}
        disabled={!username || !magicKey || isLoading}
        loading={isLoading}
        fullWidth
      >
        Login
      </Button>
    </view>
  );
} 