/**
 * Home Screen Bundle Entry Point
 */

import 'url-search-params-polyfill';
import { root } from '@lynx-js/react';
// view and text are intrinsic JSX elements in LynxJS, no import needed
import { open } from '../../navigation/bridge';
import { Layout, cn, useTheme } from '@ariob/ui';

const viewScreen = (name: string) => () => open(name);

function HomeScreen() {
  const { withTheme } = useTheme();

  return (
    <Layout className={cn(withTheme("", "dark"), "bg-background h-full flex-1")}>
      <view className="h-full flex-1 items-center justify-center p-6 bg-red-500">
        <text className="text-white text-3xl font-bold text-center">
          Kitchen App
        </text>
        <text className="text-white text-sm text-center mt-2">
          Component showcase and navigation demos for @ariob/ui
        </text>
        
        <view className="mt-8 gap-4">
          <view 
            className="bg-white px-6 py-3 rounded-lg"
            bindtap={viewScreen('components')}
          >
            <text className="text-red-500 font-semibold">Components Showcase</text>
          </view>
          
          <view 
            className="bg-white px-6 py-3 rounded-lg"
            bindtap={viewScreen('nav')}
          >
            <text className="text-red-500 font-semibold">Navigation Demo</text>
          </view>
          
          <view 
            className="bg-white px-6 py-3 rounded-lg"
            bindtap={viewScreen('settings')}
          >
            <text className="text-red-500 font-semibold">Settings</text>
          </view>
        </view>
      </view>
    </Layout>
  );
}

root.render(<HomeScreen />);
