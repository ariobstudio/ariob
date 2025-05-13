import { AuthForm } from '@/components/auth/AuthForm';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { useAuth } from '@/gun/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';
import { useCallback } from 'react';
// Main App wrapper that provides router and theme context
export function App() {
  const { user, isAuthenticated, logout } = useAuth();
  const { withTheme, currentTheme, setTheme } = useTheme();

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  const toggleTheme = useCallback(() => {
    setTheme(currentTheme === 'Light' ? 'Dark' : 'Light');
  }, [currentTheme, setTheme]);

  return (
    <page
      id="app"
      className={cn(
        withTheme('', 'dark'),
        `flex flex-col w-full h-full bg-background`,
      )}
    >
      <view className="flex w-full p-2 h-full justify-center items-center flex-col gap-2">
        <view className="w-full max-w-sm flex justify-end mb-2">
          <Button
            /* @ts-ignore - bindtap is a custom prop for this framework */
            icon={withTheme('moon', 'sun')}
            bindtap={toggleTheme}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            {withTheme('Dark Mode', 'Light Mode')}
          </Button>
        </view>
        {isAuthenticated ? (
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle>Welcome</CardTitle>
              <CardDescription>
                You are logged in as {user?.alias}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <view className="flex flex-col mt-4 text-sm text-muted-foreground">
                <text>
                  You have successfully created an account or logged in.
                </text>
                <view>
                  Your account is identified by your public key:{' '}
                  <text className="font-mono">{user?.pub}</text>
                </view>
              </view>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                bindtap={handleLogout}
                icon="log-out"
                size="lg"
                variant="destructive"
              >
                Logout
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <AuthForm />
        )}
      </view>
    </page>
  );
}
