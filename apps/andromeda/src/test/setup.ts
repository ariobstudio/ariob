import '@testing-library/jest-dom';
import { afterEach, beforeEach, vi } from 'vitest';

// Global test setup for Lynx React testing library
// This file is automatically loaded by vitest before running tests

// Global test configurations
global.elementTree = undefined;

// Reset element tree before each test
beforeEach(() => {
  global.elementTree = undefined;
});

// Cleanup after each test
afterEach(() => {
  // Clear any lingering mocks
  vi.clearAllMocks();
});

// Global mocks for Lynx-specific modules
vi.mock('@ariob/core', () => ({
  useAuth: () => ({
    user: null,
    isLoading: false,
    error: null,
    isAuthenticated: false,
    login: vi.fn(),
    logout: vi.fn(),
    signup: vi.fn(),
  }),
}));

// Suppress console warnings during tests (unless VERBOSE_TESTS is set)
if (!process.env.VERBOSE_TESTS) {
  global.console = {
    ...console,
    warn: vi.fn(),
    error: vi.fn(),
  };
}
