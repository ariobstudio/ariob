# @ariob/andromeda

> Atomic Design System following UNIX philosophy

A modular, theme-aware design system for React Native with Unistyles integration.

---

## Overview

**@ariob/andromeda** provides:

- **Themes** — Dark/Light themes with Unistyles integration
- **Atoms** — Indivisible building blocks (Text, Button, Input, Icon, etc.)
- **Molecules** — Simple atom combinations (Avatar, IconButton, InputField, Tag)
- **Organisms** — Complex UI sections (Card, Toast)
- **Layouts** — Container utilities (Box, Row, Stack, Grid, Scroll)
- **Motions** — Animation wrappers (Fade, Slide, Spring)

---

## Quick Start

```typescript
import { init, Button, Text, Avatar, Card, Row, Stack, toast } from '@ariob/andromeda';

// Initialize theme system at app start
init();

function App() {
  return (
    <Card>
      <Stack gap="md">
        <Row align="center" gap="sm">
          <Avatar char="A" tint="accent" />
          <Text color="text">Username</Text>
        </Row>
        <Button variant="solid" tint="accent" onPress={() => toast.success('Saved!')}>
          Submit
        </Button>
      </Stack>
    </Card>
  );
}
```

---

## Architecture

Following UNIX philosophy with protocol-first design:

```
@ariob/andromeda
├── themes/               # Theme system
│   ├── types.ts          # Protocol definitions
│   ├── dark.ts           # Dark theme tokens
│   ├── light.ts          # Light theme tokens
│   ├── impl.ts           # Implementation
│   └── __tests__/        # Jest tests
├── atoms/                # Indivisible components
│   ├── types.ts          # Protocols
│   ├── styles.ts         # Theme-aware styles
│   ├── Text.tsx          # Text component
│   ├── Button.tsx        # Button component
│   └── ...
├── molecules/            # Atom combinations
│   ├── types.ts
│   ├── styles.ts
│   └── ...
├── organisms/            # Complex sections
│   ├── types.ts
│   ├── styles.ts
│   └── ...
├── layouts/              # Container utilities
└── motions/              # Animation wrappers
```

---

## Theme System

### Protocol

```typescript
interface Theme {
  get(): Data;           // Get current theme data
  set(name: string): void; // Set active theme
  use(): Data;           // React hook for theme access
  list(): string[];      // Available theme names
  name(): string;        // Current theme name
}
```

### Usage

```typescript
import { theme, dark, light, init } from '@ariob/andromeda';

// Initialize at app start
init();

// Get current theme
const data = theme.get();
console.log(data.colors.accent); // '#1D9BF0'

// Switch themes
theme.set('light');

// In components - use Unistyles
import { useUnistyles } from '@ariob/andromeda';

function Component() {
  const { theme } = useUnistyles();
  return <View style={{ backgroundColor: theme.colors.surface }} />;
}
```

### Theme Data

```typescript
interface Data {
  colors: Palette;     // Color tokens
  space: Scale;        // Spacing scale
  radii: Radii;        // Border radii
  font: Font;          // Typography
  spring: Springs;     // Animation presets
  shadow: Shadows;     // Shadow presets
}
```

---

## Atoms

Indivisible building blocks with theme-aware styles.

### Text

```typescript
import { Text } from '@ariob/andromeda';

<Text size="title">Welcome</Text>
<Text size="body" color="dim">Secondary info</Text>
<Text size="caption" color="success">Saved!</Text>
```

**Sizes:** `title`, `heading`, `body`, `caption`, `mono`
**Colors:** `text`, `dim`, `faint`, `accent`, `success`, `warn`, `danger`

### Button

```typescript
import { Button } from '@ariob/andromeda';

<Button onPress={handleSubmit}>Submit</Button>
<Button variant="outline" tint="danger" onPress={handleDelete}>Delete</Button>
<Button variant="ghost" size="sm" loading>Processing</Button>
```

**Variants:** `solid`, `outline`, `ghost`
**Tints:** `default`, `accent`, `success`, `danger`
**Sizes:** `sm`, `md`, `lg`

### Input

```typescript
import { Input } from '@ariob/andromeda';

<Input
  value={text}
  onChange={setText}
  placeholder="Enter text..."
  error={!!error}
/>
```

### Icon

```typescript
import { Icon } from '@ariob/andromeda';

<Icon name="heart" size="md" color="accent" />
```

---

## Molecules

Simple combinations of atoms.

### Avatar

```typescript
import { Avatar } from '@ariob/andromeda';

<Avatar char="JD" />
<Avatar icon="person" tint="accent" size="lg" />
<Avatar char="A" onPress={openProfile} />
```

### IconButton

```typescript
import { IconButton } from '@ariob/andromeda';

<IconButton icon="settings" onPress={openSettings} />
<IconButton icon="trash" tint="danger" />
```

### InputField

```typescript
import { InputField } from '@ariob/andromeda';

<InputField
  label="Email"
  value={email}
  onChange={setEmail}
  error="Invalid email"
  required
/>
```

### Tag

```typescript
import { Tag } from '@ariob/andromeda';

<Tag tint="accent">New</Tag>
<Tag tint="success" onRemove={handleRemove}>Active</Tag>
```

---

## Organisms

Complex UI sections.

### Card

```typescript
import { Card } from '@ariob/andromeda';

<Card>
  <Text>Simple card</Text>
</Card>

<Card
  header={<Text size="heading">Title</Text>}
  footer={<Button onPress={action}>Action</Button>}
  variant="outline"
>
  <Text>Card content</Text>
</Card>
```

### Toast

```typescript
import { toast, ToastProvider, ToastContainer } from '@ariob/andromeda';

// Setup in layout
<ToastProvider>
  <App />
  <ToastContainer topInset={insets.top} />
</ToastProvider>

// Imperative API
toast('Message sent');
toast.success('Profile updated');
toast.error('Connection failed');
toast.warning('Low battery');
toast.info('New features available');

// With options
toast.success('Saved', {
  description: 'Changes saved successfully',
  duration: 5000,
  action: { label: 'Undo', onPress: handleUndo },
});
```

---

## Layouts

Container and arrangement utilities.

### Row

```typescript
import { Row } from '@ariob/andromeda';

<Row gap="sm" align="center" justify="between">
  <Avatar />
  <Text>Username</Text>
  <Badge>Online</Badge>
</Row>
```

### Stack

```typescript
import { Stack } from '@ariob/andromeda';

<Stack gap="md" align="stretch">
  <Text>Line 1</Text>
  <Text>Line 2</Text>
</Stack>
```

### Grid

```typescript
import { Grid } from '@ariob/andromeda';

<Grid columns={2} gap="sm">
  <Box>Item 1</Box>
  <Box>Item 2</Box>
</Grid>
```

### Scroll

```typescript
import { Scroll } from '@ariob/andromeda';

<Scroll horizontal>
  {items.map(item => <Card key={item.id} />)}
</Scroll>
```

---

## Tokens

Design constants exported for direct use:

```typescript
import { colors, space, radii, font, spring } from '@ariob/andromeda';

// Colors
colors.accent     // '#1D9BF0'
colors.success    // '#00BA7C'
colors.glow.cyan  // '#00E5FF'
colors.degree[0]  // '#FF6B9D' (Me)
colors.degree[1]  // '#00E5FF' (Friends)

// Spacing
space.sm  // 8
space.md  // 12
space.lg  // 16

// Radii
radii.md   // 12
radii.pill // 999

// Springs
spring.snappy // { damping: 25, stiffness: 300, mass: 0.6 }
spring.smooth // { damping: 20, stiffness: 200, mass: 0.8 }
```

---

## Unistyles Integration

All styles are theme-aware using Unistyles:

```typescript
import { StyleSheet } from 'react-native-unistyles';

const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.surface,
    padding: theme.space.md,
    borderRadius: theme.radii.lg,
  },
}));
```

---

## Documentation

For comprehensive documentation with full API references, prop tables, and detailed examples:

| Document | Description |
|----------|-------------|
| [README](../../docs/andromeda/README.md) | Overview and quick start |
| [SETUP](../../docs/andromeda/SETUP.md) | Installation and configuration |
| [THEME](../../docs/andromeda/THEME.md) | Theme system and tokens |
| [ATOMS](../../docs/andromeda/ATOMS.md) | Indivisible components |
| [MOLECULES](../../docs/andromeda/MOLECULES.md) | Atom combinations |
| [ORGANISMS](../../docs/andromeda/ORGANISMS.md) | Complex UI sections |
| [LAYOUTS](../../docs/andromeda/LAYOUTS.md) | Container utilities |
| [MOTIONS](../../docs/andromeda/MOTIONS.md) | Animation components |
| [TROUBLESHOOTING](../../docs/andromeda/TROUBLESHOOTING.md) | Common issues and solutions |

---

## License

Private package - Ariob monorepo
