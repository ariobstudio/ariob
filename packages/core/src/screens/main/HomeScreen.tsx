import React, { useState } from 'react';
import { PageContainer, Card, Button } from '../../components';
import { useTheme } from '../../components/ThemeProvider';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from '../../router';
import { useKeyManager, KeyPair } from '../../hooks/useKeyManager';

export function HomeScreen() {
  const { withTheme, isDarkMode } = useTheme();
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
        <text className={`text-2xl font-bold ${withTheme('text-gray-900', 'text-white')}`}>
          Welcome, {user?.username || 'User'}
        </text>
        <text className={`mt-1 ${withTheme('text-gray-500', 'text-gray-400')}`}>
          Your secure Ariob platform
        </text>
      </view>

      <view className="card card-section mb-4">
        <view className="mb-4">
          <text className={`text-xl font-semibold mb-2 ${withTheme('text-gray-900', 'text-white')}`}>
            Security Status
          </text>
        </view>
        <view className={`p-5 ${withTheme('bg-gray-100', 'bg-gray-800')} rounded-lg mb-4`}>
          <view className="flex items-center mb-3">
            <view className="w-12 h-12 rounded-full bg-primary mr-3 flex items-center justify-center">
              <text className="text-xl text-background">🔒</text>
            </view>
            <text className={`text-xl font-semibold ${withTheme('text-gray-700', 'text-gray-300')}`}>Secure Connection</text>
          </view>
          <text className={`text-md ${withTheme('text-gray-600', 'text-gray-400')} mb-3`}>
            Your connection is encrypted and secure
          </text>
          <view className="flex items-center">
            <view className={`h-3 ${withTheme('bg-gray-300', 'bg-gray-600')} flex-1 rounded-full overflow-hidden`}>
              <view className="h-full bg-primary w-full"></view>
            </view>
            <text className={`text-sm ${withTheme('text-gray-600', 'text-gray-400')} ml-2`}>100%</text>
          </view>
        </view>
        <Button
          variant="secondary"
          onPress={() => navigate('about')}
          className="mt-4 h-14"
          size="lg"
          icon={<text>ℹ️</text>}
        >
          About Ariob
        </Button>
      </view>

      <view className="card card-section mb-4">
        <view className="mb-3">
          <text className={`text-xl font-semibold ${withTheme('text-gray-900', 'text-white')}`}>Your Magic Key</text>
          <text className={`text-md ${withTheme('text-gray-600', 'text-gray-400')} mb-3`}>
            Keep this key safe and secure
          </text>
        </view>
        <view className={`mb-5 p-4 ${withTheme('bg-gray-100', 'bg-gray-800/50')} rounded-lg`}>
          <text className={`text-md font-mono ${withTheme('text-gray-600', 'text-gray-400')}`}>
            {user?.magicKey || 'MAG_{fkQ23...X48Z}'}
          </text>
        </view>
        <view className="flex flex-row gap-3">
          <Button
            variant="primary"
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
      </view>

      <view className="card card-section mb-4">
        <view className="mb-3">
          <text className={`text-xl font-semibold ${withTheme('text-gray-900', 'text-white')}`}>Your Public Key</text>
          <text className={`text-md ${withTheme('text-gray-600', 'text-gray-400')} mb-3`}>
            Used for secure encryption
          </text>
        </view>
        <view className={`mb-5 p-4 ${withTheme('bg-gray-100', 'bg-gray-800/50')} rounded-lg`}>
          <text className={`text-md font-mono ${withTheme('text-gray-600', 'text-gray-400')}`}>
            {publicKey}
          </text>
        </view>
        <text className={`text-sm ${withTheme('text-gray-500', 'text-gray-400')} mb-3`}>
          Total keys: {keyManager.keys.length}
        </text>
      </view>
    </PageContainer>
  );
} 