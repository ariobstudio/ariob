import '@testing-library/jest-dom';
import {
  cleanupMocks,
  createTestPost,
  mockNavigate,
  mockUIComponents,
  mockUser,
  renderWithAuth,
  renderWithMocks,
} from '@/test/test-utils';
import { fireEvent } from '@lynx-js/react/testing-library';
import { beforeEach, describe, expect, test, vi } from 'vitest';

// Simple test component using Lynx elements
const TestAuthComponent = () => {
  return (
    <view>
      <text>Test Component</text>
    </view>
  );
};

// Test component with Lynx event handling
const TestButtonComponent = ({ onTap }: { onTap?: () => void }) => {
  return (
    <view>
      <view bindtap={onTap}>
        <text>Click me</text>
      </view>
    </view>
  );
};

describe('Test Utils Infrastructure', () => {
  beforeEach(() => {
    cleanupMocks();
  });

  test('should render components with mocks', async () => {
    const { queries } = renderWithMocks(<TestAuthComponent />);

    const element = await queries.findByText('Test Component');
    expect(element).toBeInTheDocument();
  });

  test('should render components with authenticated context', async () => {
    const { queries } = renderWithAuth(<TestAuthComponent />);

    const element = await queries.findByText('Test Component');
    expect(element).toBeInTheDocument();
  });

  test('should handle Lynx event binding with bindtap', async () => {
    const handleTap = vi.fn();
    const { queries } = renderWithMocks(
      <TestButtonComponent onTap={handleTap} />,
    );

    const clickableElement = await queries.findByText('Click me');
    expect(clickableElement).toBeInTheDocument();

    // Test Lynx-specific tap event using proper Event construction
    const event = new Event('bindEvent:tap');
    Object.assign(event, {
      eventType: 'bindEvent',
      eventName: 'tap',
    });

    fireEvent(clickableElement.parentElement!, event);

    expect(handleTap).toHaveBeenCalledTimes(1);
  });

  test('should create mock user data', () => {
    expect(mockUser).toEqual(
      expect.objectContaining({
        id: 'test-user-123',
        email: 'test@ariob.studio',
        isAuthenticated: true,
      }),
    );
  });

  test('should create test post data', () => {
    const post = createTestPost({ content: 'Custom content' });

    expect(post).toEqual(
      expect.objectContaining({
        id: 'post-123',
        content: 'Custom content',
        author: mockUser,
      }),
    );
  });

  test('should mock navigation function', () => {
    expect(mockNavigate).toBeDefined();
    expect(vi.isMockFunction(mockNavigate)).toBe(true);
  });

  test('should clean up mocks properly', () => {
    mockNavigate('/test');
    expect(mockNavigate).toHaveBeenCalledWith('/test');

    cleanupMocks();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

describe('UI Component Mocking with Lynx Elements', () => {
  beforeEach(() => {
    mockUIComponents();
  });

  test('should support UI component mocking with Lynx elements', () => {
    mockUIComponents();
    expect(mockUIComponents).toBeDefined();
  });

  test('should mock Button component with Lynx bindtap support', async () => {
    const handleClick = vi.fn();

    // Test the mocked Button component directly
    const { Button } = await import('@/components/ui/button');
    const { queries } = renderWithMocks(
      <Button bindtap={handleClick}>Test Button</Button>,
    );

    const buttonText = await queries.findByText('Test Button');
    expect(buttonText).toBeInTheDocument();

    // The button should be wrapped in a view with bindtap
    const buttonView = buttonText.parentElement;
    expect(buttonView).toBeDefined();

    // Test the tap event using proper Event construction
    const event = new Event('bindEvent:tap');
    Object.assign(event, {
      eventType: 'bindEvent',
      eventName: 'tap',
    });

    fireEvent(buttonView!, event);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
