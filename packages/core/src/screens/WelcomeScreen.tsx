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
        <view className="mb-8 flex flex-col items-center">
          <image src={logo} clip-radius="true" className="mb-4 rounded-lg bg-surface-variant" style={{width: '100px', height: '100px', backgroundColor: 'transparent'}} />
          <text className="text-heading-2 font-bold text-on-background mb-1">Ariob</text>
        </view>

        <view className="p-4 rounded-lg mb-4 border border-outline" style={{ width: '100%', maxWidth: '340px' }}>
          <view className="flex flex-col items-center">
            <text className="text-2xl py-2 font-semibold text-on-surface mb-4 text-center">
              Welcome
            </text>

            <view className="w-full px-6">
              <Input
                placeholder="Enter your username"
                variant="outlined"
                style={{ width: '100%' }}
                value={username}
                onChange={handleUsernameChange}
                size="lg"
              />
            </view>

            <view className="flex flex-col gap-4" style={{ width: '100%' }}>
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
      </view>
    </Layout>
  );
} 