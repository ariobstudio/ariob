import React from 'react';
import { useRouter, Route } from '../router';
import { useTheme } from './ThemeProvider';

export type NavigationItem = {
  key: string;
  label: string;
  icon: string;
  route: Route;
};

const NAVIGATION_ITEMS: NavigationItem[] = [
  { key: 'home', label: 'Home', icon: '🏠', route: 'home' },
  { key: 'about', label: 'About', icon: 'ℹ️', route: 'about' },
  { key: 'settings', label: 'Settings', icon: '⚙️', route: 'settings' },
];

export function AppNavigation() {
  const { currentRoute, navigate } = useRouter();
  const { withTheme } = useTheme();

  return (
    <view 
      className={withTheme(
        "flex flex-row mt-auto h-16 border-t border-gray-200 bg-white",
        "flex flex-row mt-auto h-16 border-t border-gray-700 bg-gray-800"
      )}
    >
      {NAVIGATION_ITEMS.map(item => (
        <view 
          key={item.key}
          className="flex-1 flex flex-col items-center justify-center py-2"
          bindtap={() => navigate(item.route)}
        >
          <text 
            className={withTheme(
              currentRoute === item.route 
                ? "text-blue-600 text-2xl leading-6 mb-1" 
                : "text-gray-500 text-2xl leading-6 mb-1",
              currentRoute === item.route 
                ? "text-blue-500 text-2xl leading-6 mb-1" 
                : "text-gray-400 text-2xl leading-6 mb-1"
            )}
          >
            {item.icon}
          </text>
          <text 
            className={withTheme(
              currentRoute === item.route 
                ? "text-blue-600 text-xs" 
                : "text-gray-500 text-xs",
              currentRoute === item.route 
                ? "text-blue-500 text-xs" 
                : "text-gray-400 text-xs"
            )}
          >
            {item.label}
          </text>
        </view>
      ))}
    </view>
  );
} 