import React, { useState } from 'react';
import { Input, Button } from '../../components';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../components/ThemeProvider';

export function RegisterTab() {
  const [username, setUsername] = useState('');
  const [magicKey, setMagicKey] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const { register, isLoading, error } = useAuth();
  const { withTheme } = useTheme();

  const handleRegister = async () => {
    if (!username || username.trim().length < 3) return;
    
    const generatedKey = await register(username);
    if (generatedKey) {
      setMagicKey(generatedKey);
      setIsRegistered(true);
    }
  };

  if (isRegistered && magicKey) {
    return (
      <view className="py-2">
        <text className={`text-lg font-medium mb-4 ${withTheme('text-gray-900', 'text-white')}`}>
          Registration Successful!
        </text>
        
        <text className={`mb-2 ${withTheme('text-gray-500', 'text-gray-400')}`}>
          Keep your magic key safe. You'll need it to log in.
        </text>
        
        <view 
          className={`p-4 mb-4 rounded-md ${withTheme('bg-gray-100', 'bg-gray-800')}`}
        >
          <text className={`font-mono ${withTheme('text-gray-500', 'text-gray-400')}`}>
            {magicKey}
          </text>
        </view>
        
        <Button 
          variant="secondary"
          onPress={() => {
            // Copy to clipboard functionality would be implemented here
            console.log('Copy to clipboard:', magicKey);
          }}
          className="mb-2"
          icon={<text>📋</text>}
        >
          Copy Magic Key
        </Button>
      </view>
    );
  }

  return (
    <view className="py-2">
      <text className={`mb-4 ${withTheme('text-gray-500', 'text-gray-400')}`}>
        Register with a username to get your magic key
      </text>
      
      <Input
        label="Username"
        placeholder="Enter username (min 3 characters)"
        value={username}
        onChange={setUsername}
        variant="outlined"
        className="mb-4"
        error={username && username.trim().length < 3 ? "Username must be at least 3 characters" : undefined}
      />
      
      {error && (
          <text className={`text-sm mb-3 ${withTheme('text-red-500', 'text-red-400')}`}>
          {error}
        </text>
      )}
      
      <Button 
        variant="primary"
        onPress={handleRegister}
        disabled={!username || username.trim().length < 3 || isLoading}
        loading={isLoading}
        fullWidth
      >
        Register
      </Button>
    </view>
  );
} 