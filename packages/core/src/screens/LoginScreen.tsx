import { Button, Layout } from '../components';
import { useRouter } from '../router';
import logo from '@/src/assets/ariob.png';

export function LoginScreen() {
  const { navigate } = useRouter();

  return (
    <Layout>
      <view 
        className="flex-1 flex flex-col items-center justify-center px-4 bg-gradient-to-b from-background to-muted"
        style={{ width: '100%', height: '100%' }}
      >
        <view className="flex flex-col items-center space-y-2 mb-10">
          <image src={logo} clip-radius="true" className="mb-2 rounded-lg bg-muted shadow-subtle" style={{width: '100px', height: '100px', backgroundColor: 'transparent'}} />
          <text className="text-heading-2 font-bold text-foreground">Login</text>
          <text className="text-lg text-muted">Choose your method</text>
        </view>

        <view className="card card-section mb-4 w-full max-w-xs space-y-6">
          <view className="flex flex-col items-center space-y-2">
            <text className="text-2xl font-semibold text-foreground text-center">
              Authentication
            </text>
          </view>

          <view className="flex flex-col gap-3 w-full">
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
              className="h-12"
              size="lg"
            >
              Back
            </Button>
          </view>
        </view>
      </view>
    </Layout>
  );
} 