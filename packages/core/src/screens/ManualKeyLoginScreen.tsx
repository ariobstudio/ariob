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
        className="flex-1 flex flex-col items-center justify-center px-4 bg-gradient-to-b from-background to-muted"
        style={{ width: '100%', height: '100%' }}
      >
        <view className="flex flex-col items-center space-y-2 mb-10">
          <image src={logo} clip-radius="true" className="mb-2 rounded-lg bg-muted shadow-subtle" style={{width: '100px', height: '100px', backgroundColor: 'transparent'}} />
          <text className="text-heading-2 font-bold text-foreground">Magic Key</text>
          <text className="text-lg text-muted">Enter your key</text>
        </view>

        <view className="card card-section mb-4 w-full max-w-xs space-y-6">
          <view className="flex flex-col items-center space-y-2">
            <text className="text-2xl font-semibold text-foreground text-center">
              Key Authentication
            </text>
          </view>

          <view className="w-full px-2">
            <Input
              placeholder="Enter your magic key"
              variant="outlined"
              style={{ width: '100%' }}
              value={key}
              onChange={handleKeyChange}
              size="lg"
            />
          </view>

          <view className="flex items-center mb-4 px-4 bg-muted/20 rounded-lg w-full">
            <view className="w-10 h-10 rounded-full bg-muted mr-3 flex items-center justify-center">
              <text className="text-sm text-background">ℹ️</text>
            </view>
            <text className="text-sm text-muted">
              Keep your key private
            </text>
          </view>

          <view className="flex flex-col gap-3 w-full">
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
    </Layout>
  );
} 