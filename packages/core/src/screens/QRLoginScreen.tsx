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
        className="flex-1 flex flex-col items-center justify-center px-4 bg-gradient-to-b from-primary-container to-background" 
        style={{ width: '100%', height: '100%' }}
      >
        <view className="mb-8 flex flex-col items-center">
          <image src={logo} clip-radius="true" className="mb-4 rounded-lg bg-surface-variant" style={{width: '100px', height: '100px', backgroundColor: 'transparent'}} />
          <text className="text-heading-2 font-bold text-on-background mb-1">Scan QR</text>
          <text className="text-lg text-on-surface-variant">Use your mobile device</text>
        </view>

        <view className="p-4 rounded-lg mb-4 border border-outline" style={{ width: '100%', maxWidth: '340px' }}>
          <view className="flex flex-col items-center">
            <text className="text-2xl py-2 font-semibold text-on-surface mb-2 text-center">
              QR Code Login
            </text>
            <text className="text-lg text-on-surface-variant text-center mb-4">
              Expires in {formatTime(expiryTime)}
            </text>

            <view className="mb-6 p-4 bg-tertiary rounded-lg flex items-center justify-center w-full" style={{ height: '280px' }}>
              <view className="w-[240px] h-[240px] bg-white rounded-lg p-2 flex flex-col items-center justify-center">
                {/* Simulated QR code grid */}
                <view className="w-full h-full relative flex flex-col">
                  <view className="flex-1 flex">
                    <view className="w-[25%] h-[25%] bg-black m-2"></view>
                    <view className="flex-1"></view>
                    <view className="w-[25%] h-[25%] bg-black m-2"></view>
                  </view>
                  <view className="flex-1"></view>
                  <view className="flex-1 flex">
                    <view className="w-[25%] h-[25%] bg-black m-2"></view>
                    <view className="flex-1"></view>
                    <view className="flex-1"></view>
                  </view>
                </view>
                <text className="text-sm text-black mt-3">Scan with Ariob Mobile</text>
              </view>
            </view>

            <view className="flex flex-col gap-4" style={{ width: '100%' }}>
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
      </view>
    </Layout>
  );
} 