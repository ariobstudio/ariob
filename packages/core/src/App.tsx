import './tailwind.css';
import { RouterProvider, useRouter, Route } from './router';
import { 
  HomeScreen,
  SettingsScreen,
  AboutScreen,
  AuthScreen
} from './screens';
import { ThemeProvider, useTheme, AppNavigation } from './components';
import { AuthProvider } from './hooks';
import { useState, useEffect } from 'react';

// Main App wrapper that provides router and theme context
export function App() {
  const { withTheme } = useTheme();
  return (
    <page id='app' className={`flex flex-col w-full h-full`}>
      <ThemeProvider>
        <RouterProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </RouterProvider>
      </ThemeProvider>
    </page>
  );
}

// Routes that should show the bottom navigation
const AUTHENTICATED_ROUTES: Route[] = ['home', 'settings', 'about'];

// Inner component that consumes router context
function AppContent() {
  const { currentRoute } = useRouter();
  const { withTheme } = useTheme();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize the app
    setIsInitialized(true);
  }, []);

  // Loading state
  if (!isInitialized) {
    return (
      <view className="bg-background flex-1 flex justify-center items-center">
        <text className="text-on-background">Loading...</text>
      </view>
    );
  }

  // Auth route (welcome, login, register)
  if (currentRoute === 'auth') {
    return <AuthScreen />;
  }

  // Authenticated routes with bottom navigation
  if (AUTHENTICATED_ROUTES.includes(currentRoute)) {
    return (
      <view className={`flex flex-col h-full pb-safe-bottom ${withTheme('bg-white', 'bg-gray-800')}`}>
        {currentRoute === 'home' && <HomeScreen />}
        {currentRoute === 'settings' && <SettingsScreen />}
        {currentRoute === 'about' && <AboutScreen />}
        <AppNavigation />
      </view>
    );
  }

  // Fallback to auth screen
  return <AuthScreen />;
}