# 🎨 @ariob/ui

<div align="center">

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![LynxJS](https://img.shields.io/badge/LynxJS-121212?style=for-the-badge&logo=javascript&logoColor=white)](https://lynxjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

A comprehensive UI component library for Lynx applications with Tailwind CSS styling and TypeScript support.

[Overview](#-overview) • [Architecture](#-architecture) • [Installation](#-installation) • [Component Library](#-component-library) • [Theming](#-theming) • [Usage Examples](#-usage-examples) • [Contributing](#-contributing)

</div>

## 📋 Overview

`@ariob/ui` is a cross-platform UI component library built specifically for Lynx applications. It provides a comprehensive set of UI components and layout primitives that work seamlessly across iOS and other platforms, leveraging Tailwind CSS for styling and class-variance-authority (cva) for variant management.

### Key Features

- 🎯 **Platform-agnostic** - Components work consistently across all Lynx-supported platforms
- 🎨 **Tailwind-powered** - Full Tailwind CSS integration with custom presets
- 🔄 **Variant System** - Flexible component variants using class-variance-authority
- 🌙 **Dark Mode Support** - Built-in theming with light, dark, and auto modes
- 📦 **Tree-shakeable** - Import only what you need with zero side effects
- 🔒 **Type-safe** - Full TypeScript support with comprehensive type definitions
- ♿ **Accessible** - ARIA attributes and keyboard navigation support

## 🏗 Architecture

The package is organized into distinct modules for better maintainability and discoverability:

```
@ariob/ui/
├── src/
│   ├── components/
│   │   ├── ui/              # High-level UI components
│   │   │   ├── button.tsx   # Multi-variant button
│   │   │   ├── input.tsx    # Form input with validation states
│   │   │   ├── textarea.tsx # Multi-line text input
│   │   │   ├── card.tsx     # Content container components
│   │   │   ├── icon.tsx     # Lucide icon renderer
│   │   │   ├── alert.tsx    # Alert/notification component
│   │   │   └── index.ts     # UI components barrel export
│   │   └── primitives/       # Layout primitives
│   │       ├── column.tsx   # Vertical flex container
│   │       ├── row.tsx      # Horizontal flex container
│   │       ├── scrollable.tsx # Scrollable container
│   │       ├── list.tsx     # List container with virtualization
│   │       ├── list-item.tsx # List item component
│   │       └── index.ts     # Primitives barrel export
│   ├── hooks/
│   │   └── useTheme.ts      # Theme management hook
│   ├── lib/
│   │   ├── utils.ts         # Utility functions (cn, etc.)
│   │   ├── colors.ts        # Color system definitions
│   │   └── lucide.json      # Lucide icon glyphs
│   └── index.ts             # Main entry point
├── tailwind.config.js       # Tailwind configuration
├── tsconfig.json            # TypeScript config
└── package.json

```

### Design Principles

1. **Lynx-first** - All components use native Lynx elements (`<view>`, `<text>`, `<input>`)
2. **Composition over Configuration** - Components are composable building blocks
3. **Consistent API** - All components follow similar patterns for props and variants
4. **Performance** - Optimized for mobile with efficient rendering and minimal re-renders
5. **Developer Experience** - Intuitive APIs with excellent TypeScript support

## 🛠 Installation

```bash
# Using pnpm (recommended)
pnpm add @ariob/ui

# Using npm
npm install @ariob/ui

# Using yarn
yarn add @ariob/ui
```

### Prerequisites

- `@lynx-js/react` ^0.114.0 (peer dependency)
- `@lynx-js/types` 3.4.11 (peer dependency)
- Tailwind CSS configuration in your project

### Setup

1. **Configure Tailwind CSS**

Add the package to your Tailwind content configuration:

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@ariob/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  presets: [
    require('@lynx-js/tailwind-preset'),
  ],
  // ... rest of your config
};
```

2. **Import Components**

```typescript
import { Button, Card, Row, Column } from '@ariob/ui';
```

## 📚 Component Library

### UI Components

High-level, feature-rich components for building user interfaces.

#### Button

Multi-variant button component with icon support.

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
```

**Props:**
- `variant`: `default | destructive | outline | secondary | ghost | link`
- `size`: `sm | default | lg | icon`
- `icon`: Lucide icon name (optional)
- `disabled`: boolean
- `onClick`: () => void

#### Input

Form input with theme integration and validation states.

```tsx
import { Input } from '@ariob/ui';

<Input
  type="email"
  placeholder="Enter email"
  value={email}
  onChangeText={setEmail}
  aria-invalid={hasError}
/>
```

**Props:**
- `type`: `text | email | password | number | tel | url`
- `placeholder`: string
- `value`: string
- `onChangeText`: (text: string) => void
- `aria-invalid`: boolean (shows error state)
- `disabled`: boolean

#### Card

Compound component for content containers.

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@ariob/ui';

<Card>
  <CardHeader>
    <CardTitle>Dashboard</CardTitle>
    <CardDescription>Your activity overview</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content here */}
  </CardContent>
  <CardFooter>
    <Button>View Details</Button>
  </CardFooter>
</Card>
```

#### Icon

Lucide icon renderer with customizable size and color.

```tsx
import { Icon } from '@ariob/ui';

<Icon
  name="settings"
  size="lg"
  className="text-primary"
/>
```

**Props:**
- `name`: Lucide icon name from the glyph library
- `size`: `xs | sm | default | lg | xl` or number
- `className`: Additional Tailwind classes

#### Alert

Notification component for displaying messages.

```tsx
import { Alert, AlertDescription, AlertTitle } from '@ariob/ui';

<Alert variant="warning">
  <AlertTitle>Warning</AlertTitle>
  <AlertDescription>
    Your session is about to expire.
  </AlertDescription>
</Alert>
```

**Props:**
- `variant`: `default | destructive | warning | success`

### Layout Primitives

Foundational layout components for building complex UIs.

#### Column

Vertical flex container with spacing and alignment options.

```tsx
import { Column } from '@ariob/ui';

<Column spacing="md" align="center" justify="start">
  <text>Item 1</text>
  <text>Item 2</text>
  <text>Item 3</text>
</Column>
```

**Props:**
- `spacing`: `none | xs | sm | md | lg | xl` - Gap between children
- `align`: `start | center | end | stretch` - Horizontal alignment
- `justify`: `start | center | end | between | around | evenly` - Vertical distribution
- `width`: `auto | full | fit | screen` - Container width
- `height`: `auto | full | fit | screen` - Container height

#### Row

Horizontal flex container with gap and wrap options.

```tsx
import { Row } from '@ariob/ui';

<Row gap="sm" justify="between" align="center" wrap="wrap">
  <Button>Save</Button>
  <Button variant="outline">Cancel</Button>
</Row>
```

**Props:**
- `gap`: `none | xs | sm | md | lg | xl` - Gap between children
- `align`: `start | center | end | stretch | baseline` - Vertical alignment
- `justify`: `start | center | end | between | around | evenly` - Horizontal distribution
- `wrap`: `wrap | nowrap | reverse` - Flex wrap behavior
- `width`: `auto | full | fit | screen` - Container width
- `height`: `auto | full | fit | screen` - Container height

#### Scrollable

Container with scrolling capabilities and customizable scrollbar.

```tsx
import { Scrollable } from '@ariob/ui';

<Scrollable
  direction="vertical"
  showScrollbar="auto"
  height="full"
>
  {/* Long content */}
</Scrollable>
```

**Props:**
- `direction`: `horizontal | vertical | both` - Scroll direction
- `showScrollbar`: `always | never | auto` - Scrollbar visibility
- `bounce`: boolean - iOS bounce effect
- `height`: `auto | full | fit | screen` - Container height
- `maxHeight`: string - Maximum height (Tailwind class)

#### List & ListItem

Optimized list components with optional virtualization.

```tsx
import { List, ListItem } from '@ariob/ui';

<List spacing="sm" divider>
  <ListItem
    title="Settings"
    subtitle="Manage your preferences"
    icon="settings"
    onPress={() => navigate('/settings')}
  />
  <ListItem
    title="Profile"
    subtitle="View and edit profile"
    icon="user"
    arrow
  />
</List>
```

**List Props:**
- `spacing`: `none | xs | sm | md | lg` - Space between items
- `divider`: boolean - Show dividers between items
- `variant`: `default | bordered | separated` - List style

**ListItem Props:**
- `title`: string - Primary text
- `subtitle`: string - Secondary text
- `icon`: string - Leading icon name
- `arrow`: boolean - Show trailing arrow
- `onPress`: () => void - Press handler

## 🎨 Theming

### Theme Hook

The `useTheme` hook provides theme management with persistence.

```tsx
import { useTheme } from '@ariob/ui';

function ThemeToggle() {
  const { currentTheme, setTheme, withTheme } = useTheme();

  return (
    <view>
      <text>Current theme: {currentTheme}</text>

      <Button onPress={() => setTheme('Dark')}>
        Dark Mode
      </Button>

      <Button onPress={() => setTheme('Light')}>
        Light Mode
      </Button>

      <Button onPress={() => setTheme('Auto')}>
        System Default
      </Button>

      {/* Conditional rendering based on theme */}
      <Icon
        name={withTheme('sun', 'moon')}
        className="text-primary"
      />
    </view>
  );
}
```

### Color System

The package includes a comprehensive color system that integrates with Tailwind CSS:

```typescript
import { colors } from '@ariob/ui';

// Access color tokens
const primaryColor = colors.primary;
const backgroundColor = colors.background;

// Use in custom components
<view className={`bg-${colors.primary}`}>
  <text className={`text-${colors.foreground}`}>
    Themed text
  </text>
</view>
```

### Custom Themes

Extend or customize the theme by modifying your Tailwind configuration:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#your-color',
          foreground: '#your-text-color',
        },
        // ... more custom colors
      },
    },
  },
};
```

## 💡 Usage Examples

### Complete Form Example

```tsx
import { Column, Input, Button, Card, CardContent } from '@ariob/ui';
import { useState } from '@lynx-js/react';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    // Validation and submission logic
  };

  return (
    <Card>
      <CardContent>
        <Column spacing="md">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            aria-invalid={!!error}
          />

          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            aria-invalid={!!error}
          />

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Row gap="sm" justify="end">
            <Button variant="outline">Cancel</Button>
            <Button onPress={handleSubmit}>Login</Button>
          </Row>
        </Column>
      </CardContent>
    </Card>
  );
}
```

### Dashboard Layout Example

```tsx
import { Column, Row, Card, Scrollable, List, ListItem } from '@ariob/ui';

function Dashboard() {
  return (
    <Column height="screen" spacing="none">
      {/* Header */}
      <Row className="p-4 border-b" justify="between" align="center">
        <text className="text-xl font-bold">Dashboard</text>
        <Button size="icon" icon="settings" variant="ghost" />
      </Row>

      {/* Content */}
      <Scrollable height="full" className="flex-1">
        <Column spacing="md" className="p-4">
          {/* Stats Cards */}
          <Row gap="sm">
            <Card className="flex-1">
              <CardContent>
                <text className="text-sm text-muted">Revenue</text>
                <text className="text-2xl font-bold">$12,345</text>
              </CardContent>
            </Card>

            <Card className="flex-1">
              <CardContent>
                <text className="text-sm text-muted">Users</text>
                <text className="text-2xl font-bold">1,234</text>
              </CardContent>
            </Card>
          </Row>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <List divider>
                <ListItem
                  title="New user registered"
                  subtitle="2 minutes ago"
                  icon="user-plus"
                />
                <ListItem
                  title="Payment received"
                  subtitle="5 minutes ago"
                  icon="credit-card"
                />
                <ListItem
                  title="Order completed"
                  subtitle="10 minutes ago"
                  icon="check-circle"
                />
              </List>
            </CardContent>
          </Card>
        </Column>
      </Scrollable>
    </Column>
  );
}
```

## 🔧 Utilities

### Class Name Merger (cn)

Utility function for merging class names with conflict resolution:

```tsx
import { cn } from '@ariob/ui';

// Merge multiple class strings
const className = cn(
  'text-base font-medium',
  isActive && 'text-primary',
  isDisabled && 'opacity-50 cursor-not-allowed',
  customClassName
);

// Use in components
<view className={cn('p-4 rounded', className)}>
  {children}
</view>
```

## 🤝 Contributing

### Development Setup

```bash
# Clone the repository
git clone https://github.com/your-org/ariob.git

# Navigate to UI package
cd packages/ui

# Install dependencies
pnpm install

# Start development
pnpm dev
```

### Component Guidelines

When creating new components:

1. **Use Lynx Elements** - Build with `<view>`, `<text>`, and native inputs
2. **Implement Variants** - Use cva for consistent variant management
3. **Add TypeScript Types** - Export prop interfaces for all components
4. **Include Examples** - Add usage examples in documentation
5. **Test Accessibility** - Ensure ARIA attributes and keyboard support
6. **Follow Patterns** - Match existing component patterns for consistency

### File Structure for New Components

```typescript
// components/ui/new-component.tsx
import { type VariantProps, cva } from 'class-variance-authority';
import * as React from '@lynx-js/react';
import { cn } from '../../lib/utils';
import { type ViewProps } from '@lynx-js/types';

const newComponentVariants = cva(
  'base-classes',
  {
    variants: {
      variant: {
        default: 'default-classes',
      },
      size: {
        default: 'size-classes',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface NewComponentProps
  extends ViewProps,
    VariantProps<typeof newComponentVariants> {
  // Additional props
}

export const NewComponent = React.forwardRef<
  React.ElementRef<typeof View>,
  NewComponentProps
>(({ className, variant, size, ...props }, ref) => {
  return (
    <view
      ref={ref}
      className={cn(newComponentVariants({ variant, size }), className)}
      data-slot="new-component"
      {...props}
    />
  );
});

NewComponent.displayName = 'NewComponent';
```

## 📖 Additional Resources

- [UI Components Documentation](./src/components/ui/README.md)
- [Primitives Documentation](./src/components/primitives/README.md)
- [LynxJS Documentation](https://lynxjs.org)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Class Variance Authority](https://cva.style/docs)

## 📄 License

Private package - See repository root for license information.