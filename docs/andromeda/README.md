# @ariob/andromeda

> Atomic Design System following UNIX philosophy

A modular, theme-aware design system for React Native with Unistyles integration.

---

## Philosophy

**@ariob/andromeda** is built on two foundational principles:

1. **Atomic Design** (Brad Frost) - Build complex UIs from simple, composable building blocks
2. **UNIX Philosophy** - Small modules that do one thing well

The result is a design system where every component is:
- **Predictable** - Consistent APIs across all components
- **Composable** - Combine atoms into molecules, molecules into organisms
- **Theme-aware** - All styles respond to light/dark mode automatically
- **Type-safe** - Full TypeScript coverage with exported type unions

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

```
@ariob/andromeda
├── themes/          # Theme system (dark/light)
├── atoms/           # Indivisible components (Text, Button, Input, etc.)
├── molecules/       # Atom combinations (Avatar, IconButton, etc.)
├── organisms/       # Complex sections (Card, Toast)
├── layouts/         # Container utilities (Box, Row, Stack, Grid)
└── motions/         # Animation wrappers (Fade, Slide, Spring)
```

---

## Documentation

| Section | Description |
|---------|-------------|
| [Setup](./SETUP.md) | Installation & Unistyles configuration |
| [Theme](./THEME.md) | Theme system & design tokens |
| [Atoms](./ATOMS.md) | Text, Button, Input, Icon, Badge, Dot, Line, Divider, Label, Press |
| [Molecules](./MOLECULES.md) | Avatar, IconButton, InputField, Tag |
| [Organisms](./ORGANISMS.md) | Card, Toast system |
| [Layouts](./LAYOUTS.md) | Box, Row, Stack, Grid, Scroll |
| [Motions](./MOTIONS.md) | Fade, Slide, Spring animations |
| [Troubleshooting](./TROUBLESHOOTING.md) | Common issues & solutions |

---

## Key Features

### Theme-Aware Styling
All components automatically adapt to light/dark mode:

```typescript
import { useUnistyles } from '@ariob/andromeda';

function MyComponent() {
  const { theme } = useUnistyles();
  return <View style={{ backgroundColor: theme.colors.surface }} />;
}
```

### Consistent Sizing
Components use a shared sizing scale (`sm`, `md`, `lg`):

```typescript
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
```

### Semantic Tints
Color variants communicate meaning:

```typescript
<Button tint="accent">Primary Action</Button>
<Button tint="success">Confirm</Button>
<Button tint="danger">Delete</Button>
```

### Haptic Feedback
Interactive components support iOS haptics:

```typescript
<Press haptic="medium" onPress={handlePress}>
  <Text>Tap me</Text>
</Press>
```

---

## Exports

```typescript
// Theme
export { theme, init, useUnistyles, dark, light } from '@ariob/andromeda';

// Atoms
export { Text, Button, Input, Icon, Badge, Dot, Line, Divider, Label, Press } from '@ariob/andromeda';

// Molecules
export { Avatar, IconButton, InputField, Tag } from '@ariob/andromeda';

// Organisms
export { Card, Toast, ToastProvider, ToastContainer, toast } from '@ariob/andromeda';

// Layouts
export { Box, Row, Stack, Grid, Scroll } from '@ariob/andromeda';

// Motions
export { Fade, FadeEnter, FadeExit, Slide, SlideUp, SlideDown, Spring } from '@ariob/andromeda';

// Tokens (legacy)
export { colors, space, radii, font, spring, shadow } from '@ariob/andromeda';
```

---

## License

Private package - Ariob monorepo
