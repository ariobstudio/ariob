import React, { useState } from 'react';
import { Button } from '../../components';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../components/ThemeProvider';

export function QrTab() {
  const [scanning, setScanning] = useState(false);
  const { loginWithQR, isLoading, error } = useAuth();
  const { withTheme } = useTheme();

  const handleScan = async () => {
    setScanning(true);
    
    // Mock QR code scanning
    setTimeout(async () => {
      const mockQrData = 'testuser:MAG_mockQrCode123';
      await loginWithQR(mockQrData);
      setScanning(false);
    }, 2000);
  };

  return (
    <view className="py-2">
      <text className={`mb-4 ${withTheme('text-gray-500', 'text-gray-400')}`}>
        Scan the QR code from your other device to login
      </text>
      
      {scanning ? (
        <view className="flex flex-col items-center justify-center">
          <view 
            className={`w-48 h-48 mb-4 border-2 ${withTheme('border-outline', 'border-gray-700')}`}
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              alignSelf: 'center',
              backgroundColor: '#00000010',
              borderRadius: '8px'
            }}
          >
            <text className={`text-xl ${withTheme('text-gray-500', 'text-gray-400')}`}>📷</text>
            <text className={`text-sm mt-2 ${withTheme('text-gray-500', 'text-gray-400')}`}>
              Scanning...
            </text>
          </view>
          
          <Button 
            variant="outlined"
            onPress={() => setScanning(false)}
          >
            Cancel
          </Button>
        </view>
      ) : (
        <view>
          <view 
            className={`w-48 h-48 mb-4 border-2 ${withTheme('border-outline', 'border-gray-700')}`}
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              alignSelf: 'center',
              backgroundColor: '#00000005',
              borderRadius: '8px'
            }}
          >
            <text className={`text-xl ${withTheme('text-gray-500', 'text-gray-400')}`}>📷</text>
            <text className={`text-sm mt-2 ${withTheme('text-gray-500', 'text-gray-400')}`}>
              Camera preview
            </text>
          </view>
          
          {error && (
            <text className={`text-sm mb-3 ${withTheme('text-red-500', 'text-red-400')}`}>
              {error}
            </text>
          )}
          
          <Button 
            variant="primary"
            onPress={handleScan}
            loading={isLoading}
            fullWidth
          >
            Start Scanning
          </Button>
        </view>
      )}
    </view>
  );
} 