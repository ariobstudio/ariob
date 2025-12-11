/**
 * Settings Bundle Entry Point
 */

import 'url-search-params-polyfill';
import { root, useState, useEffect } from '@lynx-js/react';
// view and text are intrinsic JSX elements in LynxJS, no import needed
import { back, params as parse } from '../../navigation/bridge';
import { Layout, cn, useTheme } from '@ariob/ui';

function SettingsScreen() {
  const { withTheme } = useTheme();
  const [urlParams, setUrlParams] = useState<Record<string, string>>({});
  
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location) {
      setUrlParams(parse(window.location.href));
    }
  }, []);

  return (
    <Layout className={cn(withTheme("", "dark"), "bg-background h-full flex-1")}>
      <view className="h-full flex-1">
        <view className="bg-purple-600 pt-12 pb-4 px-6">
          <view className="flex-row items-center">
            <text 
              className="text-white text-lg pr-4"
              bindtap={back}
            >
              ← Back
            </text>
            <text className="text-white text-2xl font-bold flex-1">
              Settings
            </text>
          </view>
        </view>
        
        <view className="flex-1 p-6">
          <text className="text-gray-800 text-xl font-semibold mb-4">
            App Settings
          </text>
          
          {Object.keys(urlParams).length > 0 && (
            <view className="bg-blue-100 p-4 rounded-lg mb-4">
              <text className="text-blue-800 font-semibold mb-2">
                Received Parameters:
              </text>
              {Object.entries(urlParams).map(([key, value]) => (
                <text key={key} className="text-blue-700 text-sm">
                  {key}: {value}
                </text>
              ))}
            </view>
          )}
          
          <view className="gap-4">
            <view className="bg-white p-4 rounded-lg shadow">
              <text className="text-gray-800 font-semibold mb-2">
                Theme Settings
              </text>
              <text className="text-gray-600 text-sm mb-3">
                Configure app theme and appearance
              </text>
              <view className="flex-row gap-2">
                <view className="bg-gray-200 px-3 py-1 rounded">
                  <text className="text-gray-700 text-sm">Light</text>
                </view>
                <view className="bg-gray-800 px-3 py-1 rounded">
                  <text className="text-white text-sm">Dark</text>
                </view>
              </view>
            </view>
            
            <view className="bg-white p-4 rounded-lg shadow">
              <text className="text-gray-800 font-semibold mb-2">
                Navigation Settings
              </text>
              <text className="text-gray-600 text-sm">
                Configure navigation behavior and transitions
              </text>
            </view>
            
            <view className="bg-white p-4 rounded-lg shadow">
              <text className="text-gray-800 font-semibold mb-2">
                Developer Options
              </text>
              <text className="text-gray-600 text-sm">
                Advanced settings for development
              </text>
            </view>
            
            <view className="bg-white p-4 rounded-lg shadow">
              <text className="text-gray-800 font-semibold mb-2">
                About
              </text>
              <text className="text-gray-600 text-sm">
                Kitchen App v1.0.0
              </text>
              <text className="text-gray-500 text-xs mt-1">
                Powered by TanStack Router and ExplorerModule
              </text>
            </view>
          </view>
        </view>
      </view>
    </Layout>
  );
}

root.render(<SettingsScreen />);
