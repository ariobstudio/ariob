import { createContext, useContext, useState, ReactNode } from 'react';

export type Route = 'welcome' | 'login' | 'register' | 'home' | 'qrLogin' | 'manualKeyLogin' | 'settings' | 'auth' | 'about';

interface RouterContextType {
  currentRoute: Route;
  navigate: (route: Route) => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

export function RouterProvider({ children }: { children: ReactNode }) {
  const [currentRoute, setCurrentRoute] = useState<Route>('auth');

  const navigate = (route: Route) => {
    setCurrentRoute(route);
  };

  return (
    <RouterContext.Provider value={{ currentRoute, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const context = useContext(RouterContext);
  if (context === undefined) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
} 