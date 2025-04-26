import { Component } from '@lynx-js/react';
import { useRouter } from '../router';
import { useTheme } from './ThemeProvider';

// Use a functional component to leverage the useRouter hook
export function Navigator() {
  const { currentRoute, navigate } = useRouter();
  const { withTheme, isDarkMode } = useTheme();

  const isActive = (route: string) => currentRoute === route;

  return (
    <view 
      className={withTheme(
        "flex mt-auto h-14 border-t border-gray-200 bg-white",
        "flex mt-auto h-14 border-t border-gray-700 bg-gray-800"
      )}
    >
      <view 
        className="flex-1 flex flex-col items-center justify-center py-1"
        bindtap={() => navigate('home')}
      >
        <text 
          className={withTheme(
            `text-2xl leading-6 ${isActive('home') ? 'text-blue-600' : 'text-gray-500'}`,
            `text-2xl leading-6 ${isActive('home') ? 'text-blue-500' : 'text-gray-400'}`
          )}
        >
          🏠
        </text>
        <text 
          className={withTheme(
            `text-xs mt-0.5 ${isActive('home') ? 'text-blue-600' : 'text-gray-500'}`,
            `text-xs mt-0.5 ${isActive('home') ? 'text-blue-500' : 'text-gray-400'}`
          )}
        >
          Home
        </text>
      </view>
      <view 
        className="flex-1 flex flex-col items-center justify-center py-1"
        bindtap={() => navigate('settings')}
      >
        <text 
          className={withTheme(
            `text-2xl leading-6 ${isActive('settings') ? 'text-blue-600' : 'text-gray-500'}`,
            `text-2xl leading-6 ${isActive('settings') ? 'text-blue-500' : 'text-gray-400'}`
          )}
        >
          ⚙️
        </text>
        <text 
          className={withTheme(
            `text-xs mt-0.5 ${isActive('settings') ? 'text-blue-600' : 'text-gray-500'}`,
            `text-xs mt-0.5 ${isActive('settings') ? 'text-blue-500' : 'text-gray-400'}`
          )}
        >
          Settings
        </text>
      </view>
    </view>
  );
} 