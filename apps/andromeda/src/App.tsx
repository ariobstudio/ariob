import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SEA from '@/lib/sea.js';
import { useCallback } from 'react';

// Main App wrapper that provides router and theme context
export function App() {
  const create = useCallback(async () => {
    const pair = await SEA.pair();
    console.log(pair);
  }, []);

  return (
    <page id="app" className={`dark flex flex-col w-full h-full bg-background`}>
      <view className="flex w-full p-2 h-full justify-center items-center flex-col gap-2">
        <view className="flex w-full max-w-sm items-center gap-2">
          <Input type="email" placeholder="Email" />
          <Button bindtap={create} size=''>Generate Key Pair</Button>
        </view>
      </view>
    </page>
  );
}
