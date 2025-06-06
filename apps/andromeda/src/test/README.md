# 🧪 Testing Guide for Andromeda

<div align="center">

[![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)
[![Testing Library](https://img.shields.io/badge/Testing%20Library-E33332?style=for-the-badge&logo=testing-library&logoColor=white)](https://testing-library.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

Comprehensive testing setup and guidelines for the Andromeda application.

</div>

## 📋 Table of Contents

- [Overview](#-overview)
- [Quick Start](#-quick-start)
- [Configuration](#-configuration)
- [Writing Tests](#-writing-tests)
- [Mocking Strategies](#-mocking-strategies)
- [Running Tests](#-running-tests)
- [Best Practices](#-best-practices)
- [Troubleshooting](#-troubleshooting)
- [Examples](#-examples)

## 🎯 Overview

The Andromeda testing setup provides a robust foundation for unit and integration testing using:

- **⚡ Vitest** - Fast, ESM-first test runner
- **🎭 @lynx-js/react/testing-library** - Lynx-optimized testing utilities
- **✅ @testing-library/jest-dom** - Custom matchers for DOM assertions
- **🌐 jsdom** - DOM implementation for Node.js
- **📸 Snapshot Testing** - Component structure verification

## 🚀 Quick Start

### Basic Test Structure

```typescript
import '@testing-library/jest-dom';
import { expect, test, describe } from 'vitest';
import { render } from '@lynx-js/react/testing-library';
import { YourComponent } from '../YourComponent';

describe('YourComponent', () => {
  test('renders correctly', async () => {
    const { findByText } = render(<YourComponent />);
    
    const element = await findByText('Expected Text');
    expect(element).toBeInTheDocument();
  });
});
```

### Running Your First Test

```bash
# Run all tests
pnpm test

# Run in watch mode (recommended for development)
pnpm test:watch

# Run a specific test file
pnpm test src/components/auth/__tests__/Login.test.tsx
```

## ⚙️ Configuration

### Vitest Configuration (`vitest.config.ts`)

```typescript
import { defineConfig, mergeConfig } from 'vitest/config';
import { createVitestConfig } from '@lynx-js/react/testing-library/vitest-config';
import * as path from 'path';

const defaultConfig = await createVitestConfig();

const config = defineConfig({
  test: {
    setupFiles: ['./src/test/setup.ts'],
    environment: 'jsdom',
    globals: true,
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@ariob/core': path.resolve(__dirname, '../../packages/core'),
    },
  },
});

export default mergeConfig(defaultConfig, config);
```

### Test Setup (`setup.ts`)

```typescript
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Global test setup
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock environment variables if needed
process.env.VITE_API_URL = 'http://test.local';
```

## 📝 Writing Tests

### Key Differences from Standard React Testing

1. **Import from Lynx**
   ```typescript
   // ❌ Wrong
   import { render } from '@testing-library/react';
   
   // ✅ Correct
   import { render } from '@lynx-js/react/testing-library';
   ```

2. **Access Element Tree**
   ```typescript
   const { findByText, elementTree } = render(<Component />);
   const { getByText } = getQueriesForElement(elementTree.root!);
   ```

3. **Use Lynx Components**
   ```typescript
   import { View, Text } from '@lynx-js/react';
   
   const TestComponent = () => (
     <View>
       <Text>Hello Lynx</Text>
     </View>
   );
   ```

4. **Prefer Async Queries**
   ```typescript
   // ❌ May fail with async rendering
   const element = getByText('Loading...');
   
   // ✅ Better for async content
   const element = await findByText('Loaded!');
   ```

### Testing Patterns

#### Component Testing

```typescript
describe('UserProfile', () => {
  test('displays user information', async () => {
    const mockUser = {
      alias: 'testuser',
      displayName: 'Test User',
    };
    
    const { findByText } = render(
      <UserProfile user={mockUser} />
    );
    
    expect(await findByText('Test User')).toBeInTheDocument();
    expect(await findByText('@testuser')).toBeInTheDocument();
  });
  
  test('shows loading state', () => {
    const { getByText } = render(
      <UserProfile user={null} isLoading={true} />
    );
    
    expect(getByText('Loading...')).toBeInTheDocument();
  });
});
```

#### Hook Testing

```typescript
import { renderHook, act } from '@lynx-js/react/testing-library';
import { useCounter } from '../useCounter';

test('useCounter hook', () => {
  const { result } = renderHook(() => useCounter());
  
  expect(result.current.count).toBe(0);
  
  act(() => {
    result.current.increment();
  });
  
  expect(result.current.count).toBe(1);
});
```

#### Snapshot Testing

```typescript
test('matches snapshot', () => {
  const { elementTree } = render(<Component />);
  expect(elementTree.root).toMatchSnapshot();
});
```

## 🎭 Mocking Strategies

### Mock UI Components

```typescript
// Mock complex UI components to avoid parsing issues
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>{children}</button>
  ),
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: any) => (
    <div data-testid="card" {...props}>{children}</div>
  ),
  CardContent: ({ children }: any) => (
    <div data-testid="card-content">{children}</div>
  ),
  CardHeader: ({ children }: any) => (
    <div data-testid="card-header">{children}</div>
  ),
}));
```

### Mock Hooks

```typescript
// Mock custom hooks
vi.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: vi.fn(),
    withTheme: (dark: string, light: string) => light,
  }),
}));

// Mock authentication
vi.mock('@ariob/core', () => ({
  useWho: () => ({
    user: { alias: 'testuser', pub: 'test-pub-key' },
    isAuthenticated: true,
    isLoading: false,
    error: null,
    login: vi.fn(),
    logout: vi.fn(),
    signup: vi.fn(),
  }),
}));
```

### Mock Router

```typescript
const mockNavigate = vi.fn();
const mockLocation = { pathname: '/' };

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
    useParams: () => ({ id: 'test-id' }),
  };
});
```

### Mock Services

```typescript
// Mock service calls
vi.mock('@/services/api', () => ({
  api: {
    get: vi.fn().mockResolvedValue({ data: [] }),
    post: vi.fn().mockResolvedValue({ data: { id: '123' } }),
    put: vi.fn().mockResolvedValue({ data: { success: true } }),
    delete: vi.fn().mockResolvedValue({ data: { deleted: true } }),
  },
}));
```

## 🏃 Running Tests

### Commands

| Command | Description |
|---------|-------------|
| `pnpm test` | Run all tests |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm test:run` | Run tests once (CI mode) |
| `pnpm test:ui` | Open Vitest UI |
| `pnpm test:coverage` | Generate coverage report |

### Options

```bash
# Run specific test file
pnpm test path/to/test.tsx

# Run tests matching pattern
pnpm test --grep "auth"

# Update snapshots
pnpm test -u

# Run with reporter
pnpm test --reporter=verbose

# Debug mode
pnpm test --inspect-brk
```

## ✅ Best Practices

### 1. Test Organization

```
src/
├── components/
│   ├── auth/
│   │   ├── Login.tsx
│   │   └── __tests__/
│   │       ├── Login.test.tsx
│   │       └── Login.snapshot.test.tsx
│   └── shared/
│       └── __tests__/
└── hooks/
    └── __tests__/
```

### 2. Test Naming

```typescript
// ✅ Good: Descriptive test names
describe('LoginForm', () => {
  test('displays error message when credentials are invalid', () => {});
  test('disables submit button while loading', () => {});
  test('redirects to dashboard after successful login', () => {});
});

// ❌ Bad: Vague test names
describe('Login', () => {
  test('works', () => {});
  test('error', () => {});
});
```

### 3. Test Structure (AAA Pattern)

```typescript
test('user can submit form', async () => {
  // Arrange
  const onSubmit = vi.fn();
  const { getByRole, getByLabelText } = render(
    <Form onSubmit={onSubmit} />
  );
  
  // Act
  await userEvent.type(getByLabelText('Email'), 'test@example.com');
  await userEvent.click(getByRole('button', { name: 'Submit' }));
  
  // Assert
  expect(onSubmit).toHaveBeenCalledWith({
    email: 'test@example.com'
  });
});
```

### 4. Async Testing

```typescript
// ✅ Good: Wait for async operations
test('loads user data', async () => {
  const { findByText } = render(<UserProfile userId="123" />);
  
  // Wait for data to load
  const userName = await findByText('John Doe');
  expect(userName).toBeInTheDocument();
});

// ❌ Bad: Not waiting for async
test('loads user data', () => {
  const { getByText } = render(<UserProfile userId="123" />);
  
  // This might fail!
  expect(getByText('John Doe')).toBeInTheDocument();
});
```

### 5. Mock Cleanup

```typescript
// Clean up mocks after each test
afterEach(() => {
  vi.clearAllMocks();
});

// Reset mocks if needed
afterAll(() => {
  vi.resetAllMocks();
});
```

## ❓ Troubleshooting

### Common Issues

<details>
<summary><strong>"Invalid hook call" error</strong></summary>

**Cause:** React version mismatch

**Solution:**
```typescript
// Ensure all React imports come from @lynx-js/react
import React from '@lynx-js/react';
```
</details>

<details>
<summary><strong>"Cannot find module" error</strong></summary>

**Cause:** Path alias not configured

**Solution:** Check `vitest.config.ts` for proper alias configuration:
```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}
```
</details>

<details>
<summary><strong>"Expected ';', '}' or <eof>" error</strong></summary>

**Cause:** JSON/CSS parsing issues with complex components

**Solution:** Mock the problematic component:
```typescript
vi.mock('@/components/ComplexComponent', () => ({
  default: () => <div>Mocked Component</div>,
}));
```
</details>

<details>
<summary><strong>"Cannot read properties of null" error</strong></summary>

**Cause:** Trying to access elementTree before render

**Solution:**
```typescript
const { elementTree } = render(<Component />);
// Use elementTree.root! with non-null assertion
const queries = getQueriesForElement(elementTree.root!);
```
</details>

### Debug Tips

1. **Inspect rendered output**
   ```typescript
   const { elementTree } = render(<Component />);
   console.log(elementTree.root);
   ```

2. **Use debug function**
   ```typescript
   const { debug } = render(<Component />);
   debug(); // Prints the DOM tree
   ```

3. **Check test environment**
   ```typescript
   console.log(process.env.NODE_ENV); // Should be 'test'
   ```

4. **Enable verbose logging**
   ```bash
   pnpm test --reporter=verbose
   ```

## 💡 Examples

### Complete Test File Example

```typescript
import '@testing-library/jest-dom';
import { expect, test, describe, vi, beforeEach } from 'vitest';
import { render, fireEvent, waitFor } from '@lynx-js/react/testing-library';
import { LoginForm } from '../LoginForm';

// Mock dependencies
vi.mock('@ariob/core', () => ({
  useWho: () => ({
    login: vi.fn().mockResolvedValue({ 
      isOk: () => true, 
      value: { alias: 'testuser' } 
    }),
    isLoading: false,
    error: null,
  }),
}));

const mockNavigate = vi.fn();
vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
}));

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  test('renders login form fields', () => {
    const { getByLabelText, getByRole } = render(<LoginForm />);
    
    expect(getByLabelText('Username')).toBeInTheDocument();
    expect(getByLabelText('Password')).toBeInTheDocument();
    expect(getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });
  
  test('submits form with valid data', async () => {
    const { getByLabelText, getByRole } = render(<LoginForm />);
    const { login } = useWho();
    
    // Fill form
    fireEvent.change(getByLabelText('Username'), {
      target: { value: 'testuser' },
    });
    fireEvent.change(getByLabelText('Password'), {
      target: { value: 'password123' },
    });
    
    // Submit
    fireEvent.click(getByRole('button', { name: 'Login' }));
    
    // Verify
    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({
        method: 'traditional',
        alias: 'testuser',
        passphrase: 'password123',
      });
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });
  
  test('displays validation errors', async () => {
    const { getByRole, findByText } = render(<LoginForm />);
    
    // Submit empty form
    fireEvent.click(getByRole('button', { name: 'Login' }));
    
    // Check errors
    expect(await findByText('Username is required')).toBeInTheDocument();
    expect(await findByText('Password is required')).toBeInTheDocument();
  });
});
```

## 📚 Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Documentation](https://testing-library.com/)
- [Lynx React Testing Guide](https://lynx-js.github.io/lynx/docs/react/testing)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)

---

<div align="center">
Part of the <a href="../../README.md">Andromeda Application</a>
</div> 