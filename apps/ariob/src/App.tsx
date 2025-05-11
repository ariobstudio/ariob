import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SEA from '@/gun/sea.js';
import { useCallback, useState } from 'react';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

// Main App wrapper that provides router and theme context
export function App() {
  const [alias, setAlias] = useState("");
  const [key, setKey] = useState({});

  const handleAlias = (e: any) => {
    const value = e.detail.value;
    setAlias(value);
  }

  const create = useCallback(async () => {
    const pair = await SEA.pair();
    // console.log(pair);
    setKey(pair);
  }, []);

  return (
    <page id="app" className={`flex flex-col w-full h-full bg-background`}>
      <view className="flex w-full p-2 h-full justify-center items-center flex-col gap-2">
        <view className="flex flex-col w-full max-w-sm items-center gap-2">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Register</CardTitle>
              <CardDescription>Create a new account, you only need to provide your alias.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {/* @ts-ignore */}
              <Input type="email" placeholder="Email" bindinput={handleAlias} />
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button bindtap={create} size='lg'>Generate Key Pair</Button>
            </CardFooter>
          </Card>
        </view>
      </view>
    </page>
  );
}
