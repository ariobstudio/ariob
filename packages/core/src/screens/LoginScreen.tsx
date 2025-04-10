import { Button, Layout } from '../components';
import { useRouter } from '../router';
import logo from '@/src/assets/ariob.png';

export function LoginScreen() {
  const { navigate } = useRouter();

  return (
    <Layout>
      <view 
        className="flex-1 flex flex-col items-center justify-center px-4 bg-gradient-to-b from-primary-container to-background" 
        style={{ width: '100%', height: '100%' }}
      >
        <view className="mb-8 flex flex-col items-center">
          <image src={logo} clip-radius="true" className="mb-4 rounded-lg bg-surface-variant" style={{width: '100px', height: '100px', backgroundColor: 'transparent'}} />
          <text className="text-heading-2 font-bold text-on-background mb-1">Login</text>
          <text className="text-lg text-on-surface-variant">Choose your method</text>
        </view>

        <view className="p-4 rounded-lg mb-4 border border-outline" style={{ width: '100%', maxWidth: '340px' }}>
          <view className="flex flex-col items-center">
            <text className="text-2xl py-2 font-semibold text-on-surface mb-6 text-center">
              Authentication
            </text>

            <view className="flex flex-col gap-4" style={{ width: '100%' }}>
              <Button
                variant="primary"
                onPress={() => navigate('qrLogin')}
                className="flex items-center justify-center h-14"
                size="lg"
              >
                <text className="mr-3 text-xl">📱</text>
                <text className="text-lg">Scan QR Code</text>
              </Button>
              
              <Button
                variant="secondary"
                onPress={() => navigate('manualKeyLogin')}
                className="flex items-center justify-center h-14"
                size="lg"
              >
                <text className="mr-3 text-xl">🔑</text>
                <text className="text-lg">Enter Magic Key</text>
              </Button>

              <Button
                variant="secondary"
                onPress={() => navigate('welcome')}
                className="mt-4 h-12"
                size="lg"
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