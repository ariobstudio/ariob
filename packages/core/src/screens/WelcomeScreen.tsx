import { useState } from 'react';
import { Input, Button, Layout, ScrollableContent } from '../components';
import { useRouter } from '../router';
import logo from '@/src/assets/ariob.png'

export function WelcomeScreen() {
  const [username, setUsername] = useState('');
  const { navigate } = useRouter();

  const handleUsernameChange = (value: string) => {
    setUsername(value);
  };

  return (
    <Layout>
      <view 
        className="flex-1 flex flex-col items-center justify-center px-4 mt-10 bg-gradient-to-b from-primary-container to-background"
        style={{ width: '100%', height: '100%' }}
      >
        <view className="flex flex-col items-center space-y-2 mb-10">
          <image src={logo} clip-radius="true" className="mb-2 rounded-lg bg-surface-variant shadow-subtle" style={{width: '100px', height: '100px', backgroundColor: 'transparent'}} />
          <text className="text-heading-2 font-bold text-on-background">Ariob</text>
        </view>

        <view className="card card-section mb-4 w-full max-w-xs space-y-6">
          <view className="flex flex-col items-center space-y-2">
            <text className="text-2xl font-semibold text-on-surface text-center">
              Welcome to Ariob
            </text>
          </view>

          <view className="w-full px-2">
            <Input
              placeholder="Enter your username"
              variant="outlined"
              style={{ width: '100%' }}
              value={username}
              onChange={handleUsernameChange}
              size="lg"
            />
          </view>

          <view className="flex flex-col gap-3 w-full">
            <Button
              variant="secondary"
              onPress={() => navigate('login')}
              size="lg"
              className="h-14"
            >
              Login with Magic Key
            </Button>
            <Button
              variant="primary"
              onPress={() => {
                if (username.trim()) {
                  navigate('home');
                }
              }}
              size="lg"
              className="h-14"
            >
              Register
            </Button>
          </view>
        </view>
      </view>
    </Layout>
  );
} 