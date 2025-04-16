import { Card, Button, PageContainer } from '../components';
import { useRouter } from '../router';
import { useTheme } from '../components/ThemeProvider';

export function HomeScreen() {
  const { navigate } = useRouter();
  const { isDarkMode } = useTheme();

  return (
    <PageContainer>
      <Card className="mb-4 p-4" variant="elevated">
        <view className="mb-4">
          <text className="text-2xl py-2 font-semibold text-on-background mb-2">
            Welcome to Ariob
          </text>
          <text className="text-lg text-on-surface-variant mb-4">
            Your secure platform
          </text>
        </view>

        <view className="p-5 bg-primary-container rounded-lg mb-4">
          <view className="flex items-center mb-3">
            <view className="w-12 h-12 rounded-full bg-primary mr-3 flex items-center justify-center">
              <text className="text-xl text-on-primary">🔒</text>
            </view>
            <text className="text-xl font-semibold text-on-primary-container">Security Status</text>
          </view>
          <text className="text-md text-on-primary-container mb-3">
            Your connection is encrypted and secure
          </text>
          <view className="flex items-center">
            <view className="h-3 bg-surface flex-1 rounded-full overflow-hidden">
              <view className="h-full bg-primary w-full"></view>
            </view>
            <text className="text-sm text-on-primary-container ml-2">100%</text>
          </view>
        </view>

        <Button
          variant="secondary"
          onPress={() => navigate('welcome')}
          className="mt-4 h-14"
          size="lg"
        >
          Logout
        </Button>
      </Card>
    
      <Card className="p-4" variant="outlined">
        <view className="mb-3">
          <text className="text-xl font-semibold text-on-surface">Your Magic Keys</text>
          <text className="text-md text-on-surface-variant mb-3">
            For secure encryption
          </text>
        </view>
        
        <view className="mb-5 p-4 bg-surface-variant rounded-lg">
          <text className="text-md font-mono text-on-surface-variant">
            pub_key: MAG{'{'}fkQ23...X48Z{'}'}
          </text>
        </view>
        
        <view className="flex flex-row gap-3">
          <Button
            variant="secondary"
            className="flex-1 h-14"
            size="lg"
            onPress={() => console.log('Generate new key')}
          >
            Generate New Key
          </Button>
          <Button
            variant="secondary"
            className="flex-1 h-14"
            size="lg"
            onPress={() => console.log('Copy key')}
          >
            Copy Key
          </Button>
        </view>
      </Card>
    </PageContainer>
  );
} 