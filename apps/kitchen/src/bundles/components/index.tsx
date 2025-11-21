/**
 * Components Showcase Bundle Entry Point
 */

import 'url-search-params-polyfill';
import { root } from '@lynx-js/react';
// view and text are intrinsic JSX elements in LynxJS, no import needed
import { back } from '../../navigation/bridge';
import { Layout, cn, useTheme } from '@ariob/ui';

function ComponentsScreen() {
  const { withTheme } = useTheme();

  return (
    <Layout className={cn(withTheme("", "dark"), "bg-background h-full flex-1")}>
      <view className="h-full flex-1">
        <view className="bg-blue-500 pt-12 pb-4 px-6">
          <view className="flex-row items-center">
            <text 
              className="text-white text-lg pr-4"
              bindtap={back}
            >
              ← Back
            </text>
            <text className="text-white text-2xl font-bold flex-1">
              Components
            </text>
          </view>
        </view>
        
        <view className="flex-1 items-center justify-center p-6">
          <text className="text-gray-800 text-xl font-semibold text-center">
            Components Showcase
          </text>
          <text className="text-gray-600 text-sm text-center mt-2">
            The original Kitchen app component showcase will go here
          </text>
          
          {/* Component showcase groups */}
          <view className="mt-8 gap-4 w-full">
            <view className="bg-white p-4 rounded-lg shadow">
              <text className="text-gray-800 font-semibold">Button Components</text>
              <text className="text-gray-600 text-sm">Various button styles and states</text>
            </view>
            
            <view className="bg-white p-4 rounded-lg shadow">
              <text className="text-gray-800 font-semibold">Form Components</text>
              <text className="text-gray-600 text-sm">Input fields, checkboxes, and more</text>
            </view>
            
            <view className="bg-white p-4 rounded-lg shadow">
              <text className="text-gray-800 font-semibold">Layout Components</text>
              <text className="text-gray-600 text-sm">Grid, flex, and container examples</text>
            </view>
          </view>
        </view>
      </view>
    </Layout>
  );
}

root.render(<ComponentsScreen />);
