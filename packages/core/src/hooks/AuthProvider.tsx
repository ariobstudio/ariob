import React, { Component, createContext, ReactNode } from 'react';
import { useRouter, Route } from '../router';
import { useKeyManager, KeyPair } from './useKeyManager';

interface User {
  username: string;
  magicKey?: string;
  keyPair?: KeyPair;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, magicKey: string) => Promise<boolean>;
  loginWithQR: (qrData: string) => Promise<boolean>;
  register: (username: string) => Promise<string | null>;
  logout: () => void;
  isAuthenticated: boolean;
  generateNewKey: () => Promise<KeyPair | null>;
  getCurrentKey: () => KeyPair | undefined;
}

// Create auth context
export const AuthContext = createContext<AuthContextType | null>(null);

// Router consumer to get navigate function
function withRouter(Component: any) {
  return (props: any) => {
    const { navigate } = useRouter();
    return <Component {...props} navigate={navigate} />;
  };
}

interface AuthProviderProps {
  children: ReactNode;
  navigate: (route: Route) => void;
}

interface AuthProviderState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

// Auth provider component
class AuthProviderBase extends Component<AuthProviderProps, AuthProviderState> {
  constructor(props: AuthProviderProps) {
    super(props);
    
    this.state = {
      user: null,
      isLoading: false,
      error: null
    };
  }
  
  login = async (username: string, magicKey: string): Promise<boolean> => {
    this.setState({ isLoading: true, error: null });
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get the key manager store
      const keyManager = useKeyManager.getState();
      
      // Check if we have any keys or create one if not
      let activeKey = keyManager.getActiveKey();
      if (!activeKey) {
        activeKey = await keyManager.generateNewKeyPair();
      }
      
      const newUser = { 
        username, 
        magicKey,
        keyPair: activeKey 
      };
      
      this.setState({ user: newUser, isLoading: false });
      this.props.navigate('home');
      return true;
    } catch (err) {
      this.setState({ 
        error: 'Authentication failed. Please try again.',
        isLoading: false
      });
      return false;
    }
  };
  
  loginWithQR = async (qrData: string): Promise<boolean> => {
    this.setState({ isLoading: true, error: null });
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate parsing QR code data
      const [username, magicKey] = qrData.split(':');
      
      if (!username || !magicKey) {
        throw new Error('Invalid QR code data');
      }
      
      // Get the key manager store
      const keyManager = useKeyManager.getState();
      
      // Check if we have any keys or create one if not
      let activeKey = keyManager.getActiveKey();
      if (!activeKey) {
        activeKey = await keyManager.generateNewKeyPair();
      }
      
      const newUser = { 
        username, 
        magicKey,
        keyPair: activeKey 
      };
      
      this.setState({ user: newUser, isLoading: false });
      this.props.navigate('home');
      return true;
    } catch (err) {
      this.setState({ 
        error: 'QR authentication failed. Please try again.',
        isLoading: false
      });
      return false;
    }
  };
  
  register = async (username: string): Promise<string | null> => {
    this.setState({ isLoading: true, error: null });
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get the key manager store
      const keyManager = useKeyManager.getState();
      
      // Generate a new key pair
      const keyPair = await keyManager.generateNewKeyPair();
      
      // Generate a fake magic key based on the public key
      const magicKey = `MAG_${keyPair.publicKey.substring(4, 12)}`;
      
      const newUser = { 
        username, 
        magicKey,
        keyPair 
      };
      
      this.setState({ user: newUser, isLoading: false });
      this.props.navigate('home');
      return magicKey;
    } catch (err) {
      this.setState({ 
        error: 'Registration failed. Please try again.',
        isLoading: false
      });
      return null;
    }
  };
  
  logout = () => {
    this.setState({ user: null });
    this.props.navigate('auth');
  };
  
  generateNewKey = async (): Promise<KeyPair | null> => {
    try {
      // Get the key manager store
      const keyManager = useKeyManager.getState();
      
      // Generate a new key
      const newKey = await keyManager.generateNewKeyPair();
      
      // Update user with the new key
      if (this.state.user) {
        this.setState({
          user: {
            ...this.state.user,
            keyPair: newKey
          }
        });
      }
      
      return newKey;
    } catch (error) {
      console.error('Failed to generate new key:', error);
      return null;
    }
  };
  
  getCurrentKey = (): KeyPair | undefined => {
    // Get the key manager store
    const keyManager = useKeyManager.getState();
    return keyManager.getActiveKey();
  };
  
  render() {
    const { children } = this.props;
    const { user, isLoading, error } = this.state;
    
    const value: AuthContextType = {
      user,
      isLoading,
      error,
      login: this.login,
      loginWithQR: this.loginWithQR,
      register: this.register,
      logout: this.logout,
      isAuthenticated: !!user,
      generateNewKey: this.generateNewKey,
      getCurrentKey: this.getCurrentKey
    };
    
    return (
      <AuthContext.Provider value={value}>
        {children}
      </AuthContext.Provider>
    );
  }
}

// Export the wrapped component with router
export const AuthProvider = withRouter(AuthProviderBase); 