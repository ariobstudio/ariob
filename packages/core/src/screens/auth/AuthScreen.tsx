import React, { useState } from 'react';
import { PageContainer, Card, Button } from '../../components';
import { useTheme } from '../../components/ThemeProvider';
import { RegisterTab } from './RegisterTab';
import { LoginTab } from './LoginTab';
import { QrTab } from './QrTab';

type Tab = 'register' | 'login' | 'qr';

export function AuthScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('register');
  const { withTheme } = useTheme();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'register':
        return <RegisterTab />;
      case 'login':
        return <LoginTab />;
      case 'qr':
        return <QrTab />;
      default:
        return <RegisterTab />;
    }
  };

  return (
    <PageContainer safeAreaTop={true}>
      <view className="mb-6">
        <text className={`text-2xl font-bold ${withTheme('text-gray-900', 'text-white')}`}>
          Ariob
        </text>
        <text className={`text-md mt-2 ${withTheme('text-gray-500', 'text-gray-400')}`}>
          Your secure platform
        </text>
      </view>

      <Card 
        className="mb-4 p-0"
        variant="outlined"
      >
        <view className="flex flex-row border-b border-outline">
          <view 
            className={`flex-1 py-3 px-4 ${activeTab === 'register' ? withTheme('bg-gray-100 rounded-t-md', 'bg-gray-800 rounded-t-md') : ''}`}
            bindtap={() => setActiveTab('register')}
          >
            <text 
              className={`text-center font-medium ${
                activeTab === 'register' 
                  ? withTheme('text-gray-900', 'text-white') 
                  : withTheme('text-gray-500', 'text-gray-400')
              }`}
            >
              Register
            </text>
          </view>
          
          <view 
            className={`flex-1 py-3 px-4 ${activeTab === 'login' ? withTheme('bg-gray-100 rounded-t-md', 'bg-gray-800 rounded-t-md') : ''}`}
            bindtap={() => setActiveTab('login')}
          >
            <text 
              className={`text-center font-medium ${
                activeTab === 'login' 
                  ? withTheme('text-gray-900', 'text-white') 
                  : withTheme('text-gray-500', 'text-gray-400')
              }`}
            >
              Login
            </text>
          </view>
          
          <view 
            className={`flex-1 py-3 px-4 ${activeTab === 'qr' ? withTheme('bg-gray-100 rounded-t-md', 'bg-gray-800 rounded-t-md') : ''}`}
            bindtap={() => setActiveTab('qr')}
          >
            <text 
              className={`text-center font-medium ${
                activeTab === 'qr' 
                  ? withTheme('text-gray-900', 'text-white') 
                  : withTheme('text-gray-500', 'text-gray-400')
              }`}
            >
              QR Code
            </text>
          </view>
        </view>
        
        <view className="p-4">
          {renderTabContent()}
        </view>
      </Card>
    </PageContainer>
  );
} 