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
- 🌙 **Dark Mode Support** - Built-in theming with light, dark, and auto modes using theme variables
- 📦 **Tree-shakeable** - Import only what you need with zero side effects
- 🔒 **Type-safe** - Full TypeScript support with comprehensive type definitions
- ♿ **Accessible** - ARIA attributes and keyboard navigation support
- 🎯 **Radius Variants** - Customizable border radius for all UI components
- 📱 **Mobile-First** - Optimized default sizes for touch targets (h-10, size-6)
- ⚡ **Dual-Thread Optimized** - Proper thread directives for LynxJS architecture

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
5. **Mobile-First** - Default sizes optimized for touch targets (40px minimum)
6. **Developer Experience** - Intuitive APIs with excellent TypeScript support

### LynxJS Dual-Thread Architecture

All components in this library are optimized for LynxJS's dual-thread architecture:

- **Main Thread** - Handles UI rendering, animations, and touch gestures
- **Background Thread** - Manages React lifecycle, state updates, and business logic

**Thread Directives:**

```tsx
// Background thread - for state management and callbacks
const handleChange = (value: string) => {
  'background only';
  setState(value);
  onValueChange?.(value);
};

// Main thread - for touch/gesture handling
const handleTouchStart = (e: any) => {
  'main thread';
  setIsPressed(true);
};
```

**Best Practices:**
- ✅ All state updates run on background thread
- ✅ Touch/gesture handlers run on main thread for smooth interactions
- ✅ Network calls and heavy computation on background thread
- ✅ Animations and visual updates on main thread

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

Multi-variant button component with icon support, customizable radius, and mobile-optimized sizes.

```tsx
import { Button } from '@ariob/ui';

// Basic usage with mobile-optimized default size (h-10)
<Button variant="default">
  Click me
</Button>

// Size variants (mobile-first)
<Button size="sm">Small (h-9)</Button>
<Button size="default">Default (h-10)</Button>
<Button size="lg">Large (h-11)</Button>

// Icon buttons (increased for touch targets)
<Button size="icon"><Icon name="heart" /></Button>         // size-10 (40px)
<Button size="icon-sm"><Icon name="star" /></Button>       // size-9 (36px)
<Button size="icon-lg"><Icon name="settings" /></Button>   // size-11 (44px)

// With icon and text
<Button variant="outline">
  <Icon name="settings" />
  <text>Settings</text>
</Button>

// With loading state
<Button loading>Processing</Button>

// Custom radius
<Button radius="full">Pill Button</Button>
<Button radius="none">Sharp Button</Button>
```

**Props:**
- `variant`: `default | destructive | outline | secondary | ghost | link`
- `size`: `sm | default | lg | icon | icon-sm | icon-lg` (default: `default`)
  - `default`: h-10 (40px) - optimized for mobile touch
  - `sm`: h-9 (36px)
  - `lg`: h-11 (44px)
  - `icon`: size-10 (40px)
  - `icon-sm`: size-9 (36px)
  - `icon-lg`: size-11 (44px)
- `radius`: `none | sm | md | lg | full` (default: `md`)
- `icon`: React.ReactNode (optional)
- `loading`: boolean - Shows spinner
- `disabled`: boolean
- `onTap`: () => void

**Mobile-First Design:**
The default button height has been increased from 36px (h-9) to 40px (h-10) to meet mobile touch target guidelines. Icon buttons are now 40px by default instead of 36px.

#### Input

Form input with theme integration, dark mode support, mobile-optimized sizes, and customizable radius.

```tsx
import { Input } from '@ariob/ui';

// Basic usage with mobile-optimized default size (h-10)
<Input
  type="email"
  placeholder="Enter email"
  value={email}
  onChange={setEmail}
/>

// Size variants (mobile-first)
<Input size="sm" placeholder="Small (h-9)" />
<Input size="default" placeholder="Default (h-10)" />
<Input size="lg" placeholder="Large (h-11)" />

// Custom radius
<Input radius="full" placeholder="Pill input" />
<Input radius="none" placeholder="Sharp input" />
```

**Props:**
- `type`: `text | email | password | number | tel | digit`
- `placeholder`: string
- `value`: string
- `onChange`: (value: string) => void
- `size`: `sm | default | lg` (default: `default`)
  - `sm`: h-9 (36px)
  - `default`: h-10 (40px) - optimized for mobile
  - `lg`: h-11 (44px)
- `radius`: `none | sm | md | lg | full` (default: `md`)
- `disabled`: boolean
- `onFocus`: () => void
- `onBlur`: () => void

**Dark Mode Support:**
Uses theme variables (`bg-background`, `text-foreground`, `border-input`, `placeholder:text-muted-foreground`) that automatically adapt to light/dark themes.

#### InputGroup

Flexible input group component for enhanced input fields with addons, icons, and buttons.

```tsx
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupButton, InputGroupText, Icon } from '@ariob/ui';

// Search input with icons
<InputGroup>
  <InputGroupAddon align="inline-start">
    <Icon name="search" />
  </InputGroupAddon>
  <InputGroupInput placeholder="Search..." />
  <InputGroupAddon align="inline-end">
    <InputGroupButton size="icon-xs" onTap={handleClear}>
      <Icon name="x" />
    </InputGroupButton>
  </InputGroupAddon>
</InputGroup>

// URL input with text prefix
<InputGroup>
  <InputGroupAddon align="inline-start">
    <InputGroupText>https://</InputGroupText>
  </InputGroupAddon>
  <InputGroupInput placeholder="example.com" />
</InputGroup>

// Email input with icon
<InputGroup>
  <InputGroupAddon align="inline-start">
    <Icon name="mail" />
  </InputGroupAddon>
  <InputGroupInput placeholder="you@example.com" type="email" />
</InputGroup>
```

**InputGroup Props:**
- Standard `ViewProps`

**InputGroupAddon Props:**
- `align`: `inline-start | inline-end | block-start | block-end` (default: `inline-start`)

**InputGroupButton Props:**
- `size`: `xs | sm | icon-xs | icon-sm` (default: `xs`)
- `variant`: Standard button variants
- `onTap`: () => void

**InputGroupText Props:**
- Standard `ViewProps`
- Automatically wraps string children in `<text>` elements

**InputGroupInput Props:**
- Same as Input component but borderless

#### SearchInput

Specialized search input with built-in search icon, loading state, and clear button.

```tsx
import { SearchInput } from '@ariob/ui';

// Basic search
<SearchInput
  placeholder="Search components..."
  value={query}
  onChange={setQuery}
/>

// With loading state
<SearchInput
  value={query}
  onChange={setQuery}
  loading={isSearching}
/>

// Custom clear handler
<SearchInput
  value={query}
  onChange={setQuery}
  onClear={handleClearSearch}
/>
```

**Props:**
- `value`: string
- `placeholder`: string
- `onChange`: (value: string) => void
- `onClear`: () => void (optional - defaults to clearing value)
- `onFocus`: () => void
- `onBlur`: () => void
- `loading`: boolean - Shows loading spinner instead of clear button
- `disabled`: boolean

**Features:**
- Built-in search icon on the left
- Automatic clear button when value is present
- Loading spinner replaces clear button when loading
- Mobile-optimized height (h-10)
- Full dark mode support

#### TextArea

Multi-line text input with fixed height or auto-expanding modes.

```tsx
import { TextArea } from '@ariob/ui';

// Fixed height (default behavior)
<TextArea
  placeholder="Enter your message..."
  rows={3}
  value={message}
  onChange={setMessage}
/>

// Auto-height (expands with content)
<TextArea
  placeholder="This will expand as you type..."
  autoHeight
  rows={2}
/>

// Size variants
<TextArea size="sm" placeholder="Small textarea" />
<TextArea size="default" placeholder="Default textarea" />
<TextArea size="lg" placeholder="Large textarea" />
```

**Props:**
- `value`: string
- `placeholder`: string
- `onChange`: (value: string) => void
- `rows`: number - Number of visible text lines (default: 3)
- `autoHeight`: boolean - Whether to expand with content (default: false)
- `size`: `sm | default | lg` - Affects padding
- `radius`: `none | sm | md | lg` (default: `md`)
- `disabled`: boolean
- `onFocus`: () => void
- `onBlur`: () => void

**Important:**
`autoHeight` is disabled by default to prevent unexpected expansion. Only enable it when you want the textarea to grow dynamically with content.

#### Card

Compound component for content containers with customizable radius.

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction } from '@ariob/ui';

<Card radius="lg">
  <CardHeader>
    <CardTitle>Dashboard</CardTitle>
    <CardDescription>Your activity overview</CardDescription>
    <CardAction>
      <Button variant="ghost">
        <Icon name="ellipsis-vertical" />
      </Button>
    </CardAction>
  </CardHeader>
  <CardContent>
    {/* Content here */}
  </CardContent>
  <CardFooter>
    <Button>View Details</Button>
  </CardFooter>
</Card>
```

**Card Props:**
- `radius`: `none | sm | md | lg | full` (default: `md`)

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

#### Badge

Status indicators and labels with customizable variants and radius.

```tsx
import { Badge, Icon } from '@ariob/ui';

// Basic badges
<Badge variant="default">Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>

// With icon
<Badge variant="success">
  <Icon name="check" />
  <text>Verified</text>
</Badge>

// Custom radius
<Badge radius="none">Sharp Badge</Badge>
<Badge radius="md">Rounded Badge</Badge>
```

**Props:**
- `variant`: `default | secondary | destructive | outline | success | warning`
- `radius`: `none | sm | md | lg | full` (default: `full`)

#### Checkbox

Checkbox component with mobile-optimized sizes and customizable radius.

```tsx
import { Checkbox } from '@ariob/ui';

// Basic usage with mobile-optimized default size (24px)
<Checkbox
  checked={checked}
  onCheckedChange={setChecked}
/>

// Size variants (mobile-first)
<Checkbox size="sm" checked />      // 20px (size-5)
<Checkbox size="default" checked /> // 24px (size-6) - optimized for mobile
<Checkbox size="lg" checked />      // 28px (size-7)

// Different radius options
<Checkbox radius="none" checked />  // Square checkbox
<Checkbox radius="sm" checked />    // Slightly rounded
<Checkbox radius="md" checked />    // More rounded (default)
<Checkbox radius="lg" checked />    // Very rounded
<Checkbox radius="full" checked />  // Circular checkbox

// Indeterminate state
<Checkbox indeterminate />
```

**Props:**
- `checked`: boolean
- `onCheckedChange`: (checked: boolean) => void
- `size`: `sm | default | lg` (default: `default`)
  - `sm`: size-5 (20px)
  - `default`: size-6 (24px) - optimized for mobile touch
  - `lg`: size-7 (28px)
- `radius`: `none | sm | md | lg | full` (default: `md`)
- `disabled`: boolean
- `indeterminate`: boolean

**Mobile-First Design:**
The default checkbox size has been increased from 20px to 24px for better mobile touch targets.

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

#### Tabs

Tab navigation component with contained and scrollable variants, plus swipeable content support.

```tsx
import { Tabs, TabsList, TabsTrigger, TabsPanel, SwipeableTabsContent } from '@ariob/ui';

// Basic contained tabs
<Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsList variant="contained">
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="details">Details</TabsTrigger>
    <TabsTrigger value="settings">Settings</TabsTrigger>
  </TabsList>
  <TabsPanel value="overview">
    <text>Overview content</text>
  </TabsPanel>
  <TabsPanel value="details">
    <text>Details content</text>
  </TabsPanel>
  <TabsPanel value="settings">
    <text>Settings content</text>
  </TabsPanel>
</Tabs>

// Scrollable tabs for many options
<Tabs defaultValue="tab1">
  <TabsList variant="scrollable">
    <TabsTrigger value="tab1">Home</TabsTrigger>
    <TabsTrigger value="tab2">Profile</TabsTrigger>
    <TabsTrigger value="tab3">Messages</TabsTrigger>
    <TabsTrigger value="tab4">Notifications</TabsTrigger>
    <TabsTrigger value="tab5">Settings</TabsTrigger>
  </TabsList>
  <TabsPanel value="tab1">{/* content */}</TabsPanel>
  {/* ... */}
</Tabs>

// Swipeable tab content (full-width horizontal scroll)
<Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsList variant="scrollable">
    <TabsTrigger value="0">Beginner</TabsTrigger>
    <TabsTrigger value="1">Intermediate</TabsTrigger>
    <TabsTrigger value="2">Advanced</TabsTrigger>
  </TabsList>
  <SwipeableTabsContent>
    <view>{/* Beginner content */}</view>
    <view>{/* Intermediate content */}</view>
    <view>{/* Advanced content */}</view>
  </SwipeableTabsContent>
</Tabs>
```

**Tabs Props:**
- `value`: string - Controlled active tab value
- `defaultValue`: string - Default active tab for uncontrolled mode
- `onValueChange`: (value: string) => void

**TabsList Props:**
- `variant`: `contained | scrollable` (default: `contained`)
- `orientation`: `horizontal | vertical` (default: `horizontal`)

**TabsTrigger Props:**
- `value`: string - Unique identifier for this tab
- `disabled`: boolean

**Features:**
- Material Design-compliant tab navigation
- Contained variant: tabs in a rounded background container
- Scrollable variant: horizontally scrollable with animated indicator
- Swipeable content with native scroll physics
- Automatic active state management
- Full dark mode support

#### Sheet

Bottom sheet/modal component with swipe-to-dismiss gestures.

```tsx
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetBody } from '@ariob/ui';

function ShareDialog() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onTap={() => setOpen(true)}>Share</Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom">
          <SheetHeader showHandle showClose>
            <SheetTitle>Share Document</SheetTitle>
            <SheetDescription>
              Choose how you want to share this document
            </SheetDescription>
          </SheetHeader>
          <SheetBody>
            <Column spacing="md">
              <Button variant="outline">
                <Icon name="mail" />
                <text>Email</text>
              </Button>
              <Button variant="outline">
                <Icon name="link" />
                <text>Copy Link</text>
              </Button>
            </Column>
          </SheetBody>
        </SheetContent>
      </Sheet>
    </>
  );
}
```

**Sheet Props:**
- `open`: boolean - Controls visibility
- `onOpenChange`: (open: boolean) => void

**SheetContent Props:**
- `side`: `bottom | top` (default: `bottom`)

**SheetHeader Props:**
- `showHandle`: boolean - Show drag handle (default: true)
- `showClose`: boolean - Show close button (default: true)

**Features:**
- Smooth slide-in/slide-out animations
- Swipe-to-dismiss with drag threshold (100px)
- Touch gesture handling on main thread for smooth UX
- Semi-transparent overlay with fade animation
- Max height of 85vh to prevent full-screen takeover
- Proper close animation cleanup

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

#### Carousel

Native horizontal pager component for page-based navigation with swipe gestures.

```tsx
import { Carousel } from '@ariob/ui';

// Controlled mode
function PagedContent() {
  const [page, setPage] = useState(0);

  return (
    <>
      <text>Current Page: {page + 1} of 3</text>

      <Carousel currentPage={page} onPageChange={setPage}>
        <view className="w-full h-full bg-primary/10 flex items-center justify-center">
          <text className="text-2xl font-bold">Page 1</text>
        </view>
        <view className="w-full h-full bg-secondary/10 flex items-center justify-center">
          <text className="text-2xl font-bold">Page 2</text>
        </view>
        <view className="w-full h-full bg-accent/10 flex items-center justify-center">
          <text className="text-2xl font-bold">Page 3</text>
        </view>
      </Carousel>

      <Row spacing="sm">
        <Button onTap={() => setPage(0)}>Page 1</Button>
        <Button onTap={() => setPage(1)}>Page 2</Button>
        <Button onTap={() => setPage(2)}>Page 3</Button>
      </Row>
    </>
  );
}

// Uncontrolled mode
<Carousel defaultPage={0} onPageChange={(page) => console.log('Page:', page)}>
  <view>Page 1</view>
  <view>Page 2</view>
  <view>Page 3</view>
</Carousel>
```

**Props:**
- `currentPage`: number - Current page index (0-based) for controlled mode
- `defaultPage`: number - Default page for uncontrolled mode (default: 0)
- `onPageChange`: (page: number) => void - Callback when page changes
- `pagingEnabled`: boolean - Whether paging is enabled (default: true)

**Features:**
- Native iOS paging with smooth momentum
- Automatic gesture conflict resolution (vertical scroll vs horizontal paging)
- Controlled and uncontrolled modes
- Proper dual-thread optimization with `'background only'` directive
- Each child automatically wrapped in a full-width/height container

**Use Cases:**
- Onboarding flows
- Image galleries
- Step-by-step wizards
- Dashboard panels

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