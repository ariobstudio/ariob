# Testing Setup for Andromeda

This directory contains the testing configuration and utilities for the Andromeda app using the Lynx React Testing Library.

## Overview

The testing setup uses:
- **Vitest** as the test runner
- **@lynx-js/react/testing-library** for component testing
- **@testing-library/jest-dom** for additional matchers
- **jsdom** as the test environment

## Configuration

### Vitest Config (`vitest.config.ts`)
```typescript
import { defineConfig, mergeConfig } from 'vitest/config'
import { createVitestConfig } from '@lynx-js/react/testing-library/vitest-config'
import * as path from 'path'

const defaultConfig = await createVitestConfig()
const config = defineConfig({
  test: {
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@ariob/core': path.resolve(__dirname, '../../packages/core'),
    },
  },
})

export default mergeConfig(defaultConfig, config)
```

### Test Setup (`setup.ts`)
```typescript
import '@testing-library/jest-dom'
// Global test setup for Lynx React testing library
```

## Writing Tests

### Basic Test Structure

```typescript
import '@testing-library/jest-dom'
import { expect, test, vi } from 'vitest'
import { render, getQueriesForElement } from '@lynx-js/react/testing-library'

test('Component Test', async () => {
  render(<YourComponent />)
  
  const { findByText } = getQueriesForElement(elementTree.root!)
  
  const element = await findByText('Expected Text')
  expect(element).toBeInTheDocument()
})
```

### Key Differences from Standard React Testing

1. **Import from Lynx**: Use `@lynx-js/react/testing-library` instead of `@testing-library/react`
2. **Element Tree**: Access rendered elements via `elementTree.root!`
3. **Lynx Components**: Use Lynx components (`<view>`, `<text>`, `<image>`) for simple tests
4. **Async Queries**: Prefer `findByText` over `getByText` for better async handling

### Testing Lynx Components

```typescript
const TestComponent = () => {
  return (
    <view>
      <text>Hello World</text>
      <view>
        <text>Nested Content</text>
      </view>
    </view>
  )
}

test('Lynx Component', async () => {
  render(<TestComponent />)
  
  const { findByText } = getQueriesForElement(elementTree.root!)
  
  const hello = await findByText('Hello World')
  const nested = await findByText('Nested Content')
  
  expect(hello).toBeInTheDocument()
  expect(nested).toBeInTheDocument()
  
  // Snapshot testing
  expect(elementTree.root).toMatchSnapshot()
})
```

### Mocking UI Components

When testing components that use complex UI libraries, mock them to avoid parsing issues:

```typescript
// Mock UI components
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>{children}</button>
  ),
}))

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardHeader: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardTitle: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
}))
```

### Mocking Hooks and Services

```typescript
// Mock custom hooks
vi.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    withTheme: (dark: string, light: string) => light,
    currentTheme: 'Light',
    setTheme: vi.fn(),
  }),
}))

// Mock core services
vi.mock('@ariob/core', () => ({
  useAuth: () => ({
    user: null,
    isLoading: false,
    error: null,
    isAuthenticated: false,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}))

// Mock router
const mockNavigate = vi.fn()
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})
```

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests once
pnpm test:run

# Run specific test file
pnpm test:run src/components/auth/__tests__/basic.test.tsx

# Run tests with UI
pnpm test:ui

# Run tests with coverage
pnpm test:coverage
```

## Best Practices

1. **Start Simple**: Begin with basic Lynx components before testing complex UI
2. **Mock Dependencies**: Mock external dependencies and complex UI components
3. **Use Async Queries**: Prefer `findByText` over `getByText` for better reliability
4. **Snapshot Testing**: Use snapshots to verify component structure
5. **Test Behavior**: Focus on user interactions and component behavior
6. **Organize Tests**: Group related tests in describe blocks
7. **Clear Test Names**: Use descriptive test names that explain what is being tested

## Troubleshooting

### Common Issues

1. **"Invalid hook call"**: Usually caused by React version mismatches. Ensure all React imports come from `@lynx-js/react`
2. **"Cannot find module"**: Check path aliases in `vitest.config.ts`
3. **"Expected ';', '}' or <eof>"**: Usually caused by JSON parsing issues. Mock the problematic components
4. **"Cannot read properties of null"**: Ensure `elementTree.root!` is used correctly

### Debug Tips

1. Use `console.log(elementTree.root)` to inspect the rendered structure
2. Add `--reporter=verbose` to see detailed test output
3. Use `expect(elementTree.root).toMatchSnapshot()` to see the actual structure
4. Check the vitest config for proper path resolution

## Examples

See the test files in `src/components/auth/__tests__/` for working examples:
- `basic.test.tsx` - Simple Lynx component testing
- `simple.test.tsx` - Basic testing setup verification

## Resources

- [Lynx React Documentation](https://lynx-js.github.io/lynx/docs/react)
- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Documentation](https://testing-library.com/) 