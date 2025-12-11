/**
 * Navigation Bundle Entry Point
 */

import 'url-search-params-polyfill';
import { root } from '@lynx-js/react';
// view and text are intrinsic JSX elements in LynxJS, no import needed
import { back, open } from '../../navigation/bridge';
import { Layout, cn, useTheme } from '@ariob/ui';

function NavScreen() {
  const { withTheme } = useTheme();

  const send = () => {
    open('settings', {
      params: {
        from: 'nav',
        timestamp: Date.now(),
      },
    });
  };

  return (
    <Layout className={cn(withTheme("", "dark"), "bg-background h-full flex-1")}>
      <view className="h-full flex-1">
        <view className="bg-purple-500 pt-12 pb-4 px-6">
          <view className="flex-row items-center">
            <text 
              className="text-white text-lg pr-4"
              bindtap={back}
            >
              ← Back
            </text>
            <text className="text-white text-2xl font-bold flex-1">
              Navigation Demo
            </text>
          </view>
        </view>
        
        <view className="flex-1 p-6">
          <text className="text-gray-800 text-xl font-semibold mb-4">
            Navigation Features
          </text>
          
          <view className="gap-4">
            <view className="bg-white p-4 rounded-lg shadow">
              <text className="text-gray-800 font-semibold mb-2">
                URL-Based Navigation
              </text>
              <text className="text-gray-600 text-sm">
                Each screen is an independent bundle loaded via schema URLs
              </text>
            </view>
            
            <view className="bg-white p-4 rounded-lg shadow">
              <text className="text-gray-800 font-semibold mb-2">
                Parameter Passing
              </text>
              <text className="text-gray-600 text-sm mb-3">
                Pass parameters via URL query strings
              </text>
              <view 
                className="bg-purple-500 px-4 py-2 rounded"
                bindtap={send}
              >
                <text className="text-white text-sm font-medium">
                  Navigate to Settings with Params
                </text>
              </view>
            </view>
            
            <view className="bg-white p-4 rounded-lg shadow">
              <text className="text-gray-800 font-semibold mb-2">
                Native Integration
              </text>
              <text className="text-gray-600 text-sm">
                Uses ExplorerModule for seamless native navigation
              </text>
            </view>
            
            <view className="bg-white p-4 rounded-lg shadow">
              <text className="text-gray-800 font-semibold mb-2">
                Bundle Architecture
              </text>
              <text className="text-gray-600 text-sm">
                Each screen is built as a separate bundle for modularity and performance
              </text>
            </view>
          </view>
        </view>
      </view>
    </Layout>
  );
}

root.render(<NavScreen />);
