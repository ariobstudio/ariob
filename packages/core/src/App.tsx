import './styles/main.scss';
import { Layout } from './components/Layout';
import { RouterProvider, useRouter } from './router';
import { 
  WelcomeScreen, 
  LoginScreen, 
  QRLoginScreen, 
  ManualKeyLoginScreen, 
  HomeScreen 
} from './screens';
import { Header } from './components/Header';

// Main App wrapper that provides router context
export function App() {
  return (
    <page className="theme-light bg-background" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <RouterProvider>
        <AppContent />
      </RouterProvider>
    </page>
  );
}

// Inner component that consumes router context
function AppContent() {
  const { currentRoute } = useRouter();

  // Render different screens with appropriate layout
  const getHeader = () => {
    if (currentRoute === 'home') {
      return (
        <Header
          title="Ariob"
          rightContent={
            <text className="text-md text-on-surface-variant">Version 1.0</text>
          }
        />
      );
    }
    return null;
  };

  // Render the appropriate screen based on current route
  const getContent = () => {
    switch (currentRoute) {
      case 'welcome':
        return <WelcomeScreen />;
      case 'login':
        return <LoginScreen />;
      case 'qrLogin':
        return <QRLoginScreen />;
      case 'manualKeyLogin':
        return <ManualKeyLoginScreen />;
      case 'home':
        return <HomeScreen />;
      default:
        return <WelcomeScreen />;
    }
  };

  return getContent();
}