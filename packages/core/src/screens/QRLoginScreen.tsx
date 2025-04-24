import { useState, useEffect } from 'react';
import { Button, Layout } from '../components';
import { useRouter } from '../router';
import logo from '@/src/assets/ariob.png';

export function QRLoginScreen() {
  const { navigate } = useRouter();
  const [expiryTime, setExpiryTime] = useState(120); // 2 minutes in seconds
  
  // Simulated countdown for QR code expiry
  useEffect(() => {
    if (expiryTime <= 0) return;
    
    const timer = setTimeout(() => {
      setExpiryTime(prev => prev - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [expiryTime]);

  // Format the time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Layout>
      <view 
        className="flex-1 flex flex-col items-center justify-center px-4 bg-gradient-to-b from-background to-muted"
        style={{ width: '100%', height: '100%' }}
      >
        <view className="flex flex-col items-center space-y-2 mb-10">
          <image src={logo} clip-radius="true" className="mb-2 rounded-lg bg-muted shadow-subtle" style={{width: '100px', height: '100px', backgroundColor: 'transparent'}} />
          <text className="text-heading-2 font-bold text-foreground">Scan QR</text>
          <text className="text-lg text-muted">Use your mobile device</text>
        </view>

        <view className="card card-section mb-4 w-full max-w-xs space-y-6">
          <view className="flex flex-col items-center space-y-2">
            <text className="text-2xl font-semibold text-foreground text-center">
              QR Code Login
            </text>
            <text className="text-lg text-muted text-center">
              Expires in {formatTime(expiryTime)}
            </text>
          </view>

          <view className="mb-4 p-4 bg-background rounded-lg flex items-center justify-center w-full" style={{ height: '240px' }}>
            <view className="w-[180px] h-[180px] bg-white rounded-lg p-2 flex flex-col items-center justify-center shadow-subtle">
              {/* Simulated QR code grid */}
              <view className="w-full h-full relative flex flex-col">
                <view className="flex-1 flex">
                  <view className="w-[25%] h-[25%] bg-foreground m-2"></view>
                  <view className="flex-1"></view>
                  <view className="w-[25%] h-[25%] bg-foreground m-2"></view>
                </view>
                <view className="flex-1"></view>
                <view className="flex-1 flex">
                  <view className="w-[25%] h-[25%] bg-foreground m-2"></view>
                  <view className="flex-1"></view>
                  <view className="flex-1"></view>
                </view>
              </view>
              <text className="text-sm text-muted mt-3">Scan with Ariob Mobile</text>
            </view>
          </view>

          <view className="flex flex-col gap-3 w-full">
            <Button
              variant="primary"
              onPress={() => {
                // Mock successful login
                navigate('home');
              }}
              size="lg"
              className="h-14"
            >
              Mock Scan Success
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