import React, { useState } from 'react';
import { PageContainer, Card, Button } from '../../components';
import { useTheme } from '../../components/ThemeProvider';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from '../../router';
import { useKeyManager, KeyPair } from '../../hooks/useKeyManager';

export function HomeScreen() {
  const { withTheme } = useTheme();
  const { user, generateNewKey } = useAuth();
  const { navigate } = useRouter();
  const keyManager = useKeyManager();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const activeKey = keyManager.getActiveKey();
  const publicKey = activeKey?.publicKey || user?.keyPair?.publicKey || 'No key available';

  const handleGenerateKey = async () => {
    setIsGenerating(true);
    try {
      await generateNewKey();
    } catch (error) {
      console.error('Error generating key:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyKey = () => {
    // In a real app, you would use the clipboard API
    console.log('Copying key to clipboard:', publicKey);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <PageContainer safeAreaTop={true}>
      <view className="mb-4">
        <text className={`text-2xl font-bold ${withTheme('text-on-background')}`}>
          Welcome, {user?.username || 'User'}
        </text>
        <text className={`mt-1 ${withTheme('text-on-surface-variant')}`}>
          Your secure Ariob platform
        </text>
      </view>

      <Card className="mb-4 p-4" variant="elevated">
        <view className="mb-4">
          <text className={`text-xl font-semibold mb-2 ${withTheme('text-on-surface')}`}>
            Security Status
          </text>
        </view>

        <view className={`p-5 ${withTheme('bg-primary-container')} rounded-lg mb-4`}>
          <view className="flex items-center mb-3">
            <view className={`w-12 h-12 rounded-full ${withTheme('bg-primary')} mr-3 flex items-center justify-center`}>
              <text className={`text-xl ${withTheme('text-on-primary')}`}>🔒</text>
            </view>
            <text className={`text-xl font-semibold ${withTheme('text-on-primary-container')}`}>Secure Connection</text>
          </view>
          <text className={`text-md ${withTheme('text-on-primary-container')} mb-3`}>
            Your connection is encrypted and secure
          </text>
          <view className="flex items-center">
            <view className={`h-3 ${withTheme('bg-surface')} flex-1 rounded-full overflow-hidden`}>
              <view className={`h-full ${withTheme('bg-primary')} w-full`}></view>
            </view>
            <text className={`text-sm ${withTheme('text-on-primary-container')} ml-2`}>100%</text>
          </view>
        </view>

        <Button
          variant="outlined"
          onPress={() => navigate('about')}
          className="mt-4 h-14"
          size="lg"
          icon={<text>ℹ️</text>}
        >
          About Ariob
        </Button>
      </Card>
    
      <Card className="p-4 mb-4" variant="outlined">
        <view className="mb-3">
          <text className={`text-xl font-semibold ${withTheme('text-on-surface')}`}>Your Magic Key</text>
          <text className={`text-md ${withTheme('text-on-surface-variant')} mb-3`}>
            Keep this key safe and secure
          </text>
        </view>
        
        <view className={`mb-5 p-4 ${withTheme('bg-surface-variant')} rounded-lg`}>
          <text className={`text-md font-mono ${withTheme('text-on-surface-variant')}`}>
            {user?.magicKey || 'MAG_{fkQ23...X48Z}'}
          </text>
        </view>
        
        <view className="flex flex-row gap-3">
          <Button
            variant="secondary"
            className="flex-1 h-14"
            size="lg"
            icon={<text>🔄</text>}
            onPress={handleGenerateKey}
            loading={isGenerating}
            disabled={isGenerating}
          >
            Generate New
          </Button>
          <Button
            variant="secondary"
            className="flex-1 h-14"
            size="lg"
            icon={<text>{isCopied ? '✅' : '📋'}</text>}
            onPress={handleCopyKey}
          >
            {isCopied ? 'Copied!' : 'Copy Key'}
          </Button>
        </view>
      </Card>

      <Card className="p-4" variant="outlined">
        <view className="mb-3">
          <text className={`text-xl font-semibold ${withTheme('text-on-surface')}`}>Your Public Key</text>
          <text className={`text-md ${withTheme('text-on-surface-variant')} mb-3`}>
            Used for secure encryption
          </text>
        </view>
        
        <view className={`mb-5 p-4 ${withTheme('bg-surface-variant')} rounded-lg`}>
          <text className={`text-md font-mono ${withTheme('text-on-surface-variant')}`}>
            {publicKey}
          </text>
        </view>
        
        <text className={`text-sm ${withTheme('text-on-surface-variant')} mb-3`}>
          Total keys: {keyManager.keys.length}
        </text>
      </Card>
    </PageContainer>
  );
} 