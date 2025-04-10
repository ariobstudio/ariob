import { useState } from 'react';
import { Button, Input, Layout } from '../components';
import { useRouter } from '../router';
import logo from '@/src/assets/ariob.png';

export function ManualKeyLoginScreen() {
  const [key, setKey] = useState('');
  const { navigate } = useRouter();

  const handleKeyChange = (value: string) => {
    setKey(value);
  };

  return (
    <Layout>
      <view 
        className="flex-1 flex flex-col items-center justify-center px-4 bg-gradient-to-b from-primary-container to-background" 
        style={{ width: '100%', height: '100%' }}
      >
        <view className="mb-8 flex flex-col items-center">
          <image src={logo} clip-radius="true" className="mb-4 rounded-lg bg-surface-variant" style={{width: '100px', height: '100px', backgroundColor: 'transparent'}} />
          <text className="text-heading-2 font-bold text-on-background mb-1">Magic Key</text>
          <text className="text-lg text-on-surface-variant">Enter your key</text>
        </view>

        <view className="p-4 rounded-lg mb-4 border border-outline" style={{ width: '100%', maxWidth: '340px' }}>
          <view className="flex flex-col items-center">
            <text className="text-2xl py-2 font-semibold text-on-surface mb-6 text-center">
              Key Authentication
            </text>

            <view className="w-full px-6">
              <Input
                placeholder="Enter your magic key"
                variant="outlined"
                style={{ width: '100%' }}
                value={key}
                onChange={handleKeyChange}
                size="lg"
              />
            </view>

            <view className="flex items-center mb-6 px-12 bg-tertiary/10 rounded-lg w-full">
              <view className="w-10 h-10 rounded-full bg-tertiary mr-3 flex items-center justify-center">
                <text className="text-sm text-on-tertiary">ℹ️</text>
              </view>
              <text className="text-sm text-on-surface-variant">
                Keep your key private
              </text>
            </view>

            <view className="flex flex-col gap-4" style={{ width: '100%' }}>
              <Button
                variant="primary"
                onPress={() => {
                  if (key.trim()) {
                    navigate('home');
                  }
                }}
                size="lg"
                className="h-14"
              >
                Login
              </Button>
              
              <Button
                variant="secondary"
                onPress={() => navigate('login')}
                size="lg"
                className="h-12"
              >
                Back
              </Button>
            </view>
          </view>
        </view>
      </view>
    </Layout>
  );
} 