# UI Components

This directory contains high-level, feature-rich UI components for building user interfaces in Lynx applications. All components are built with TypeScript, Tailwind CSS, and class-variance-authority for consistent styling and behavior.

## Architecture

All components follow these standardized patterns:

- **Lynx Elements**: Built using native Lynx elements (`<view>`, `<text>`, `<input>`)
- **Variants**: Managed with class-variance-authority (cva) for consistent styling
- **Theming**: Full integration with light/dark mode and custom color schemes
- **Accessibility**: ARIA attributes, focus states, and keyboard navigation support
- **Data Attributes**: `data-slot` attributes for component identification and testing
- **TypeScript**: Full type safety with exported interfaces for all props
- **Performance**: Optimized for mobile with minimal re-renders

## Component Reference

### Button (`button.tsx`)

Multi-variant button component with icon support and multiple states.

```tsx
import { Button } from '@ariob/ui';

// Basic usage
<Button variant="default" size="lg">
  Click me
</Button>

// With icon
<Button variant="outline" icon="settings">
  Settings
</Button>

// Icon-only button
<Button variant="ghost" size="icon" icon="x" />

// Disabled state
<Button disabled>Disabled</Button>
```

**Props:**
- `variant`: `default | destructive | outline | secondary | ghost | link`
- `size`: `sm | default | lg | icon`
- `icon`: string - Lucide icon name (optional)
- `disabled`: boolean
- `onClick`: () => void
- `className`: string - Additional Tailwind classes

**Variants Explained:**
- `default`: Primary action button with solid background
- `destructive`: Danger/delete actions with red styling
- `outline`: Secondary actions with border only
- `secondary`: Alternative actions with subtle background
- `ghost`: Minimal styling, often for icon buttons
- `link`: Text-only button styled as a link

### Input (`input.tsx`)

Form input with theme integration, validation states, and type support.

```tsx
import { Input } from '@ariob/ui';

// Basic text input
<Input
  type="text"
  placeholder="Enter your name"
  value={name}
  onChangeText={setName}
/>

// Email with validation
<Input
  type="email"
  placeholder="Email address"
  value={email}
  onChangeText={setEmail}
  aria-invalid={!isValidEmail}
  aria-describedby="email-error"
/>

// Password input
<Input
  type="password"
  placeholder="Password"
  secureTextEntry
/>

// Disabled input
<Input
  disabled
  value="Read-only value"
/>
```

**Props:**
- `type`: `text | email | password | number | tel | url`
- `placeholder`: string
- `value`: string
- `onChangeText`: (text: string) => void
- `aria-invalid`: boolean - Shows error state
- `aria-describedby`: string - ID of error message element
- `disabled`: boolean
- `secureTextEntry`: boolean - For password inputs
- `maxLength`: number
- `autoComplete`: string
- `className`: string

### Card (`card.tsx`)

Compound component system for creating content containers with header, body, and footer sections.

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction
} from '@ariob/ui';

// Complete card example
<Card>
  <CardHeader>
    <CardTitle>Dashboard Overview</CardTitle>
    <CardDescription>Your activity for the last 30 days</CardDescription>
    <CardAction>
      <Button size="icon" variant="ghost" icon="more-vertical" />
    </CardAction>
  </CardHeader>
  <CardContent>
    <text>Main content goes here</text>
  </CardContent>
  <CardFooter>
    <Row justify="between">
      <text className="text-sm text-muted">Last updated: 2 min ago</text>
      <Button variant="outline">View Details</Button>
    </Row>
  </CardFooter>
</Card>

// Simple card
<Card>
  <CardContent>
    <text>Simple content card</text>
  </CardContent>
</Card>
```

**Components:**
- `Card`: Main container with border and shadow
- `CardHeader`: Top section with title and actions
- `CardTitle`: Main heading text
- `CardDescription`: Subtitle or description text
- `CardAction`: Action buttons in header (positioned right)
- `CardContent`: Main body content area
- `CardFooter`: Bottom section for actions or metadata

### Icon (`icon.tsx`)

Lucide icon renderer with customizable size and styling.

```tsx
import { Icon } from '@ariob/ui';

// Basic icon
<Icon name="settings" />

// Sized icon
<Icon name="user" size="lg" />

// Custom size (in pixels)
<Icon name="home" size={32} />

// Styled icon
<Icon
  name="heart"
  className="text-red-500 animate-pulse"
/>

// In button
<Button>
  <Icon name="download" size="sm" />
  Download
</Button>
```

**Props:**
- `name`: string - Lucide icon name from glyph library
- `size`: `xs | sm | default | lg | xl` or number
  - `xs`: 12px
  - `sm`: 16px
  - `default`: 20px
  - `lg`: 24px
  - `xl`: 32px
- `className`: string - Additional Tailwind classes
- `strokeWidth`: number - Line thickness (default: 2)

### Alert (`alert.tsx`)

Notification component for displaying important messages with contextual styling.

```tsx
import { Alert, AlertTitle, AlertDescription } from '@ariob/ui';

// Information alert
<Alert>
  <AlertTitle>New Feature</AlertTitle>
  <AlertDescription>
    We've added new collaboration features to your workspace.
  </AlertDescription>
</Alert>

// Warning alert
<Alert variant="warning">
  <Icon name="alert-triangle" />
  <AlertTitle>Warning</AlertTitle>
  <AlertDescription>
    Your subscription will expire in 3 days.
  </AlertDescription>
</Alert>

// Error alert
<Alert variant="destructive">
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>
    Failed to save changes. Please try again.
  </AlertDescription>
</Alert>

// Success alert
<Alert variant="success">
  <Icon name="check-circle" />
  <AlertDescription>
    Your changes have been saved successfully.
  </AlertDescription>
</Alert>
```

**Props:**
- `variant`: `default | destructive | warning | success`
- `className`: string

**Sub-components:**
- `AlertTitle`: Bold heading for the alert
- `AlertDescription`: Detailed message content

### Textarea (`textarea.tsx`)

Multi-line text input with auto-resize and character counting.

```tsx
import { Textarea } from '@ariob/ui';

// Basic textarea
<Textarea
  placeholder="Enter your message"
  value={message}
  onChangeText={setMessage}
/>

// With rows and max length
<Textarea
  placeholder="Description (max 500 characters)"
  rows={4}
  maxLength={500}
  value={description}
  onChangeText={setDescription}
/>

// Error state
<Textarea
  placeholder="Required field"
  aria-invalid={!description}
  aria-describedby="desc-error"
/>

// Disabled
<Textarea
  disabled
  value="Read-only content"
/>
```

**Props:**
- `placeholder`: string
- `value`: string
- `onChangeText`: (text: string) => void
- `rows`: number - Initial visible rows (default: 3)
- `maxLength`: number - Character limit
- `disabled`: boolean
- `aria-invalid`: boolean - Error state
- `aria-describedby`: string
- `autoResize`: boolean - Auto-grow with content
- `className`: string

## Advanced Patterns

### Form Validation Example

```tsx
import { Input, Button, Alert, Column } from '@ariob/ui';
import { useState } from '@lynx-js/react';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!email.includes('@')) {
      newErrors.email = 'Invalid email address';
    }
    if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <Column spacing="md">
      <view>
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          aria-invalid={!!errors.email}
          aria-describedby="email-error"
        />
        {errors.email && (
          <text id="email-error" className="text-sm text-destructive mt-1">
            {errors.email}
          </text>
        )}
      </view>

      <view>
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          aria-invalid={!!errors.password}
          aria-describedby="password-error"
        />
        {errors.password && (
          <text id="password-error" className="text-sm text-destructive mt-1">
            {errors.password}
          </text>
        )}
      </view>

      <Button onPress={() => validate() && handleSubmit()}>
        Sign In
      </Button>
    </Column>
  );
}
```

### Custom Card Layouts

```tsx
// Stats card
function StatCard({ title, value, change, icon }) {
  return (
    <Card>
      <CardContent>
        <Row justify="between" align="start">
          <Column spacing="xs">
            <text className="text-sm text-muted">{title}</text>
            <text className="text-2xl font-bold">{value}</text>
            <text className={cn(
              'text-sm',
              change > 0 ? 'text-green-500' : 'text-red-500'
            )}>
              {change > 0 ? '↑' : '↓'} {Math.abs(change)}%
            </text>
          </Column>
          <Icon name={icon} size="lg" className="text-primary" />
        </Row>
      </CardContent>
    </Card>
  );
}

// User profile card
function UserCard({ user }) {
  return (
    <Card>
      <CardHeader>
        <Row gap="md" align="center">
          <view className="w-12 h-12 rounded-full bg-primary/10">
            <Icon name="user" className="m-auto" />
          </view>
          <Column spacing="xs">
            <CardTitle>{user.name}</CardTitle>
            <CardDescription>{user.role}</CardDescription>
          </Column>
        </Row>
      </CardHeader>
      <CardContent>
        <Column spacing="sm">
          <Row gap="sm">
            <Icon name="mail" size="sm" className="text-muted" />
            <text className="text-sm">{user.email}</text>
          </Row>
          <Row gap="sm">
            <Icon name="phone" size="sm" className="text-muted" />
            <text className="text-sm">{user.phone}</text>
          </Row>
        </Column>
      </CardContent>
      <CardFooter>
        <Row gap="sm" justify="end">
          <Button variant="outline" size="sm">Message</Button>
          <Button size="sm">View Profile</Button>
        </Row>
      </CardFooter>
    </Card>
  );
}
```

### Loading States

```tsx
// Button with loading state
function LoadingButton({ loading, ...props }) {
  return (
    <Button disabled={loading} {...props}>
      {loading ? (
        <>
          <Icon name="loader-2" className="animate-spin" />
          Loading...
        </>
      ) : (
        props.children
      )}
    </Button>
  );
}

// Skeleton card loader
function CardSkeleton() {
  return (
    <Card>
      <CardContent>
        <Column spacing="sm">
          <view className="h-4 w-32 bg-muted animate-pulse rounded" />
          <view className="h-3 w-full bg-muted animate-pulse rounded" />
          <view className="h-3 w-3/4 bg-muted animate-pulse rounded" />
        </Column>
      </CardContent>
    </Card>
  );
}
```

## Component Development Guidelines

### Creating New Components

Follow this template for consistency:

```tsx
import { type VariantProps, cva } from 'class-variance-authority';
import * as React from '@lynx-js/react';
import { cn } from '../../lib/utils';
import { type ViewProps } from '@lynx-js/types';

// 1. Define variants
const newComponentVariants = cva(
  'base-classes focus-visible:ring-2 focus-visible:ring-primary',
  {
    variants: {
      variant: {
        default: 'default-classes',
        secondary: 'secondary-classes',
      },
      size: {
        sm: 'size-sm-classes',
        default: 'size-default-classes',
        lg: 'size-lg-classes',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

// 2. Define TypeScript interface
export interface NewComponentProps
  extends ViewProps,
    VariantProps<typeof newComponentVariants> {
  // Component-specific props
  icon?: string;
  label?: string;
  onAction?: () => void;
}

// 3. Create component with forwardRef
export const NewComponent = React.forwardRef<
  React.ElementRef<typeof View>,
  NewComponentProps
>(({ className, variant, size, icon, label, onAction, ...props }, ref) => {
  return (
    <view
      ref={ref}
      className={cn(newComponentVariants({ variant, size }), className)}
      data-slot="new-component"
      onPress={onAction}
      {...props}
    >
      {icon && <Icon name={icon} />}
      {label && <text>{label}</text>}
      {props.children}
    </view>
  );
});

// 4. Set display name
NewComponent.displayName = 'NewComponent';

// 5. Export component and variants
export { newComponentVariants };
```

### Best Practices

1. **Accessibility First**
   - Always include ARIA attributes
   - Ensure keyboard navigation works
   - Provide focus indicators
   - Include screen reader labels

2. **Performance Optimization**
   - Use React.memo for expensive components
   - Minimize re-renders with proper dependency arrays
   - Lazy load heavy components
   - Use virtualization for long lists

3. **Testing Strategy**
   - Use data-slot attributes for reliable selection
   - Test all variants and states
   - Verify accessibility requirements
   - Test on multiple screen sizes

4. **Documentation**
   - Include TypeScript interfaces
   - Provide usage examples
   - Document all props
   - Show common patterns

## Testing Components

### Using data-slot Attributes

```tsx
// Component
<Button data-slot="submit-button">Submit</Button>

// Cypress test
cy.get('[data-slot="submit-button"]').click();

// Testing Library
const button = screen.getByTestId('submit-button');
fireEvent.press(button);

// Playwright
await page.locator('[data-slot="submit-button"]').click();
```

### Testing Variants

```tsx
// Test all button variants
['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'].forEach(variant => {
  it(`renders ${variant} variant correctly`, () => {
    render(<Button variant={variant}>Test</Button>);
    expect(screen.getByText('Test')).toHaveClass(/* expected classes */);
  });
});
```

## Theming

### Using Theme Hook

```tsx
import { useTheme } from '@ariob/ui';

function ThemedComponent() {
  const { currentTheme, withTheme } = useTheme();

  return (
    <view className={withTheme('bg-white', 'bg-gray-900')}>
      <text className={withTheme('text-black', 'text-white')}>
        Current theme: {currentTheme}
      </text>
      <Icon
        name={withTheme('sun', 'moon')}
        className="text-primary"
      />
    </view>
  );
}
```

### Custom Theme Colors

Extend theme colors in your Tailwind config:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#your-primary-color',
          foreground: '#your-primary-text',
        },
        // Add more custom colors
      },
    },
  },
};
```

## Cross-Platform Compatibility

All components use Lynx elements ensuring native rendering:

- **iOS**: Native UIKit components
- **Android**: Native Android View components
- **Web**: Standard HTML with CSS

Platform-specific adjustments:

```tsx
// Use platform detection if needed
import { Platform } from '@lynx-js/react';

const styles = {
  padding: Platform.OS === 'ios' ? 16 : 12,
};
```

## Resources

- [Main UI Package Documentation](../../README.md)
- [Primitives Documentation](../primitives/README.md)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Class Variance Authority](https://cva.style/docs)
- [LynxJS Documentation](https://lynxjs.org)
- [Lucide Icons](https://lucide.dev)