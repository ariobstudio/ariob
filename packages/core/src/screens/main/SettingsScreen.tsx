import React, { useState } from 'react';
import { PageContainer, Card, Button } from '../../components';
import { useTheme } from '../../components/ThemeProvider';
import { useAuth } from '../../hooks/useAuth';
import { useKeyManager, KeyPair } from '../../hooks/useKeyManager';

// Individual theme option component
interface ThemeOptionProps {
  label: string;
  isSelected: boolean;
  onSelect: () => void;
}

function ThemeOption({ label, isSelected, onSelect }: ThemeOptionProps) {
  const { withTheme, isDarkMode } = useTheme();
  
  return (
    <view 
      bindtap={onSelect}
      className={withTheme(
        "bg-white rounded-lg mb-2 p-3 flex flex-row justify-between items-center",
        "bg-gray-800 rounded-lg mb-2 p-3 flex flex-row justify-between items-center"
      )}
      style={{
        borderWidth: isSelected ? '1px' : '0',
        borderColor: isDarkMode ? '#60a5fa' : '#3b82f6',
        borderStyle: 'solid'
      }}
    >
      <text className={withTheme("text-gray-900", "text-white")}>
        {label}
      </text>
      {isSelected && (
        <view
          className={withTheme(
            "bg-blue-600 rounded-full flex justify-center items-center",
            "bg-blue-500 rounded-full flex justify-center items-center"
          )}
          style={{
            width: '24px',
            height: '24px'
          }}
        >
          <text className="text-white">✓</text>
        </view>
      )}
    </view>
  );
}

// Key item component
interface KeyItemProps {
  keyPair: KeyPair;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

function KeyItem({ keyPair, isActive, onSelect, onDelete }: KeyItemProps) {
  const { withTheme, isDarkMode } = useTheme();
  
  return (
    <view 
      className={withTheme(
        "bg-white rounded-lg mb-2 p-3 flex flex-col",
        "bg-gray-800 rounded-lg mb-2 p-3 flex flex-col"
      )}
      style={{
        borderWidth: isActive ? '1px' : '0',
        borderColor: isDarkMode ? '#60a5fa' : '#3b82f6',
        borderStyle: 'solid'
      }}
    >
      <view className="flex flex-row justify-between items-center mb-2">
        <text className={withTheme("font-medium text-gray-900", "font-medium text-white")}>
          Key ID: {keyPair.id.substring(0, 6)}...
        </text>
        {isActive && (
          <view
            className={withTheme(
              "bg-blue-600 rounded-full px-2 py-1",
              "bg-blue-500 rounded-full px-2 py-1"
            )}
          >
            <text className="text-xs text-white">Active</text>
          </view>
        )}
      </view>
      
      <view className="flex flex-row items-center mb-2">
        <text className={withTheme("text-xs text-gray-500", "text-xs text-gray-400")}>
          Public: {keyPair.publicKey.substring(0, 10)}...
        </text>
      </view>
      
      <view className="flex flex-row justify-between items-center mt-1">
        <view 
          bindtap={onSelect}
          className={isActive
            ? "transparent rounded"
            : withTheme("bg-blue-100 rounded", "bg-blue-900 rounded")
          }
          style={{
            padding: '6px 12px'
          }}
        >
          <text className={isActive
            ? withTheme("text-xs text-gray-500", "text-xs text-gray-400")
            : withTheme("text-xs text-blue-800", "text-xs text-blue-200")
          }>
            {isActive ? 'Current' : 'Use This Key'}
          </text>
        </view>
        
        {!isActive && (
          <view 
            bindtap={onDelete}
            className={withTheme("bg-red-100 rounded", "bg-red-900 rounded")}
            style={{
              padding: '6px 12px'
            }}
          >
            <text className={withTheme("text-xs text-red-800", "text-xs text-red-200")}>
              Delete
            </text>
          </view>
        )}
      </view>
    </view>
  );
}

export function SettingsScreen() {
  const { theme, isDarkMode, setTheme, withTheme } = useTheme();
  const { logout, generateNewKey } = useAuth();
  const keyManager = useKeyManager();
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handleNewKey = async () => {
    setIsGenerating(true);
    try {
      await generateNewKey();
    } catch (error) {
      console.error('Error generating key:', error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleSelectKey = (id: string) => {
    keyManager.setActiveKey(id);
  };
  
  const handleDeleteKey = (id: string) => {
    keyManager.removeKey(id);
  };

  return (
    <PageContainer safeAreaTop={true}>
      <view className="mb-4">
        <text className={withTheme("text-2xl font-bold text-gray-900", "text-2xl font-bold text-white")}>
          Settings
        </text>
      </view>

      <Card className={withTheme("mb-4 p-4 bg-white", "mb-4 p-4 bg-gray-800")}>
        <text className={withTheme("text-xl font-semibold mb-4 text-gray-900", "text-xl font-semibold mb-4 text-white")}>
          Theme
        </text>
        
        <view className="mb-6">
          <ThemeOption
            label="Auto"
            isSelected={theme === 'auto'}
            onSelect={() => setTheme('auto')}
          />
          <ThemeOption
            label="Light"
            isSelected={theme === 'light'}
            onSelect={() => setTheme('light')}
          />
          <ThemeOption
            label="Dark"
            isSelected={theme === 'dark'}
            onSelect={() => setTheme('dark')}
          />
        </view>
      </Card>
      
      <Card className={withTheme("mb-4 p-4 bg-white", "mb-4 p-4 bg-gray-800")}>
        <text className={withTheme("text-xl font-semibold mb-4 text-gray-900", "text-xl font-semibold mb-4 text-white")}>
          Key Management
        </text>
        
        <view className="mb-4">
          {keyManager.keys.map((keyPair) => (
            <KeyItem
              key={keyPair.id}
              keyPair={keyPair}
              isActive={keyPair.id === keyManager.activeKeyId}
              onSelect={() => handleSelectKey(keyPair.id)}
              onDelete={() => handleDeleteKey(keyPair.id)}
            />
          ))}
        </view>
        
        <Button
          variant="primary"
          onPress={handleNewKey}
          loading={isGenerating}
          disabled={isGenerating}
          icon={<text>🔑</text>}
          className="mb-4"
          fullWidth
        >
          Generate New Key
        </Button>
      </Card>
      
      <Card className={withTheme("mb-4 p-4 bg-white", "mb-4 p-4 bg-gray-800")}>
        <text className={withTheme("text-xl font-semibold mb-4 text-gray-900", "text-xl font-semibold mb-4 text-white")}>
          Account
        </text>
        
        <Button
          variant="outlined"
          onPress={logout}
          icon={<text>🚪</text>}
          fullWidth
        >
          Logout
        </Button>
      </Card>
      
      <Card className={withTheme("mb-4 p-4 bg-white", "mb-4 p-4 bg-gray-800")}>
        <text className={withTheme("text-xl font-semibold mb-4 text-gray-900", "text-xl font-semibold mb-4 text-white")}>
          About
        </text>
        
        <view
          className={withTheme("bg-gray-100 p-3 mb-2 rounded-lg", "bg-gray-700 p-3 mb-2 rounded-lg")}
        >
          <text className={withTheme("text-gray-700", "text-gray-300")}>
            Ariob v1.0.0
          </text>
        </view>
      </Card>
    </PageContainer>
  );
} 