import { getQueriesForElement, render } from '@lynx-js/react/testing-library';
import { ReactNode } from 'react';
import { expect, vi } from 'vitest';

// Mock data for testing
export const mockUser = {
  id: 'test-user-123',
  email: 'test@ariob.studio',
  isAuthenticated: true,
  profile: {
    name: 'Test User',
    avatar: null,
  },
};

// Auth context mock factory
export const createMockAuthContext = (overrides = {}) => ({
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
  login: vi.fn(),
  logout: vi.fn(),
  signup: vi.fn(),
  ...overrides,
});

// Mock authenticated user context
export const mockAuthenticatedContext = createMockAuthContext({
  user: mockUser,
  isAuthenticated: true,
});

// Mock navigation function
export const mockNavigate = vi.fn();

// Custom render function with common providers and mocks
export const renderWithMocks = (ui: ReactNode, options = {}) => {
  // Setup common mocks before rendering
  vi.mock('@ariob/core', () => ({
    useAuth: () => createMockAuthContext(),
  }));

  vi.mock('react-router', async () => {
    const actual = await vi.importActual('react-router');
    return {
      ...actual,
      useNavigate: () => mockNavigate,
    };
  });

  vi.mock('@/hooks/useTheme', () => ({
    useTheme: () => ({
      withTheme: (dark: string, light: string) => light,
      currentTheme: 'Light',
      setTheme: vi.fn(),
    }),
  }));

  const result = render(ui);
  return {
    ...result,
    queries: getQueriesForElement(elementTree.root!),
  };
};

// Custom render for authenticated components
export const renderWithAuth = (ui: ReactNode, options = {}) => {
  vi.mock('@ariob/core', () => ({
    useAuth: () => mockAuthenticatedContext,
  }));

  return renderWithMocks(ui, options);
};

// Common UI component mocks
export const mockUIComponents = () => {
  vi.mock('@/components/ui/button', () => ({
    Button: ({ children, bindtap, onClick, ...props }: any) => (
      <view bindtap={bindtap || onClick} {...props}>
        <text>{children}</text>
      </view>
    ),
  }));

  vi.mock('@/components/ui/card', () => ({
    Card: ({ children, ...props }: any) => <view {...props}>{children}</view>,
    CardContent: ({ children, ...props }: any) => (
      <view {...props}>{children}</view>
    ),
    CardHeader: ({ children, ...props }: any) => (
      <view {...props}>{children}</view>
    ),
    CardTitle: ({ children, ...props }: any) => (
      <text {...props}>{children}</text>
    ),
    CardDescription: ({ children, ...props }: any) => (
      <text {...props}>{children}</text>
    ),
    CardFooter: ({ children, ...props }: any) => (
      <view {...props}>{children}</view>
    ),
  }));

  vi.mock('@/components/ui/icon', () => ({
    Icon: ({ name, ...props }: any) => (
      <text data-icon={name} {...props}>
        {name}
      </text>
    ),
  }));
};

// Helper to wait for async operations
export const waitForAsync = () =>
  new Promise((resolve) => setTimeout(resolve, 0));

// Test data factories
export const createTestPost = (overrides = {}) => ({
  id: 'post-123',
  content: 'Test post content',
  author: mockUser,
  createdAt: new Date().toISOString(),
  likes: 0,
  comments: [],
  ...overrides,
});

// Clean up function for tests
export const cleanupMocks = () => {
  vi.clearAllMocks();
  mockNavigate.mockClear();
};

// Custom matchers for Lynx components (using existing jest-dom matchers)
export const expectLynxElement = (element: any) => ({
  toBeVisible: () => expect(element).toBeInTheDocument(),
  toHaveText: (text: string) => expect(element).toHaveTextContent(text),
  toBeClickable: () => expect(element).toBeEnabled(),
});
