# Theme System

Complete reference for the @ariob/andromeda theme system.

---

## Overview

The theme system provides:
- **Dark and Light themes** with semantic color tokens
- **Design tokens** for spacing, typography, radii, shadows, and animations
- **Unistyles integration** for automatic theme switching
- **Protocol pattern** for clean theme access

---

## Theme Protocol

```typescript
interface Theme {
  get(): Data;              // Get current theme data (static)
  set(name: string): void;  // Set active theme by name
  use(): Data;              // React hook to access current theme
  list(): string[];         // List available theme names
  name(): string;           // Get current theme name
}
```

### Usage

```typescript
import { theme, useUnistyles } from '@ariob/andromeda';

// Static access (outside components)
const colors = theme.get().colors;
console.log(colors.accent); // '#1D9BF0'

// Switch theme
theme.set('light');

// In components - use the hook
function Component() {
  const { theme } = useUnistyles();
  return <View style={{ backgroundColor: theme.colors.surface }} />;
}
```

---

## Color Palette

### Base Colors

| Token | Dark | Light | Usage |
|-------|------|-------|-------|
| `bg` | `#000000` | `#F7F7FA` | App background |
| `surface` | `#0F1216` | `#FFFFFF` | Card/container background |
| `elevated` | `#16181C` | `#F2F3F7` | Elevated surface |
| `muted` | `#1F2226` | `#E8E9F0` | Muted/subtle background |

### Text Colors

| Token | Dark | Light | Usage |
|-------|------|-------|-------|
| `text` | `#E7E9EA` | `#1F2125` | Primary text |
| `dim` | `#A0A4AA` | `#4A4D52` | Secondary text |
| `faint` | `#6B6F76` | `#6F737C` | Tertiary/disabled text |

### Semantic Colors

| Token | Dark | Light | Usage |
|-------|------|-------|-------|
| `accent` | `#1D9BF0` | `#0A84FF` | Primary actions, links |
| `success` | `#00BA7C` | `#0A915E` | Success states |
| `warn` | `#F5A524` | `#CB8600` | Warning states |
| `danger` | `#F91880` | `#D7265E` | Error/destructive actions |
| `info` | `#7856FF` | `#3D5AFE` | Informational |

### Glow Colors (Liquid Trust Bioluminescence)

```typescript
glow: {
  cyan: '#00E5FF',   // Primary bioluminescent
  teal: '#1DE9B6',   // Secondary glow
  blue: '#448AFF',   // Accent glow
}
```

### Degree Colors (Social Proximity)

| Degree | Name | Color | Description |
|--------|------|-------|-------------|
| 0 | Me | `#FF6B9D` (pink) | Personal content |
| 1 | Friends | `#00E5FF` (cyan) | Direct connections |
| 2 | World | `#7C4DFF` (purple) | Extended network |
| 3 | Discover | `#FFC107` (amber) | Recommendations |
| 4 | Noise | `#78909C` (gray) | Unfiltered content |

### Content Type Indicators

```typescript
indicator: {
  profile: '#00BA7C',  // Green for profiles
  message: '#1D9BF0',  // Blue for messages
  auth: '#7856FF',     // Purple for auth
  ai: '#FACC15',       // Yellow for AI
  post: '#E7E9EA',     // White for posts
}
```

### Border Colors

| Token | Value | Usage |
|-------|-------|-------|
| `border` | `rgba(255,255,255,0.08)` | Standard borders |
| `borderSubtle` | `rgba(255,255,255,0.04)` | Subtle dividers |
| `borderStrong` | `rgba(255,255,255,0.15)` | Emphasized borders |

### Overlay Colors

| Token | Value | Usage |
|-------|-------|-------|
| `glass` | `rgba(16,18,22,0.9)` | Glassmorphism backgrounds |
| `overlay` | `rgba(0,0,0,0.85)` | Modal overlays |

---

## Spacing Scale

```typescript
space = {
  xxs: 2,    // Micro spacing
  xs: 4,     // Extra small
  sm: 8,     // Small
  md: 12,    // Medium (default)
  lg: 16,    // Large
  xl: 20,    // Extra large
  xxl: 28,   // 2x extra large
  xxxl: 40,  // 3x extra large
}
```

### Usage

```typescript
const { theme } = useUnistyles();

<View style={{ padding: theme.space.md, gap: theme.space.sm }} />
```

---

## Border Radii

```typescript
radii = {
  sm: 6,     // Small (buttons, inputs)
  md: 12,    // Medium (cards)
  lg: 18,    // Large (modals)
  xl: 24,    // Extra large
  pill: 999, // Fully rounded (pills, avatars)
}
```

### Usage

```typescript
<View style={{ borderRadius: theme.radii.md }} />
```

---

## Typography

```typescript
font = {
  title: {
    size: 24,
    weight: '700',
    spacing: -0.5,
  },
  heading: {
    size: 18,
    weight: '600',
  },
  body: {
    size: 15,
    weight: '500',
    height: 20,
  },
  caption: {
    size: 12,
    weight: '500',
  },
  mono: {
    size: 11,
    weight: '600',
    spacing: 0.4,
  },
}
```

### Usage with Text Component

```typescript
<Text size="title">Large Title</Text>
<Text size="heading">Section Heading</Text>
<Text size="body">Body text content</Text>
<Text size="caption">Small caption</Text>
<Text size="mono">monospace code</Text>
```

---

## Shadows

```typescript
shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
}
```

### Usage

```typescript
<View style={{ ...theme.shadow.md }} />
```

---

## Animation Springs

```typescript
spring = {
  snappy: { damping: 25, stiffness: 300, mass: 0.6 },  // Quick taps
  smooth: { damping: 20, stiffness: 200, mass: 0.8 },  // Standard transitions
  bouncy: { damping: 12, stiffness: 150, mass: 1.0 },  // Playful
  gentle: { damping: 16, stiffness: 120, mass: 1.0 },  // Slow reveals
}
```

### Usage with Reanimated

```typescript
import { withSpring } from 'react-native-reanimated';

const animatedValue = withSpring(targetValue, theme.spring.snappy);
```

---

## Effects

### Divider Effects

```typescript
effects.divider = {
  subtle: 'rgba(255,255,255,0.03)',
  strong: 'rgba(255,255,255,0.08)',
}
```

### Outline Effects

```typescript
effects.outline = {
  focus: 'rgba(29,155,240,0.45)',  // Focus ring
  glow: 'rgba(0,229,255,0.30)',    // Glow outline
}
```

### Glow Effects

```typescript
effects.glow = {
  accent: 'rgba(29,155,240,0.35)',
  cyan: 'rgba(0,229,255,0.40)',
  success: 'rgba(0,186,124,0.35)',
}
```

---

## Complete Theme Data Type

```typescript
interface Data {
  colors: {
    bg: string;
    surface: string;
    elevated: string;
    muted: string;
    text: string;
    dim: string;
    faint: string;
    accent: string;
    success: string;
    warn: string;
    danger: string;
    info: string;
    glow: { cyan: string; teal: string; blue: string };
    degree: { 0: string; 1: string; 2: string; 3: string; 4: string };
    indicator: { profile: string; message: string; auth: string; ai: string; post: string };
    border: string;
    borderSubtle: string;
    borderStrong: string;
    glass: string;
    overlay: string;
  };
  space: { xxs: number; xs: number; sm: number; md: number; lg: number; xl: number; xxl: number; xxxl: number };
  radii: { sm: number; md: number; lg: number; xl: number; pill: number };
  font: { title: FontStyle; heading: FontStyle; body: FontStyle; caption: FontStyle; mono: FontStyle };
  spring: { snappy: Spring; smooth: Spring; bouncy: Spring; gentle: Spring };
  shadow: { sm: Shadow; md: Shadow; lg: Shadow };
}
```

---

## Custom Themes

To create a custom theme, extend the base data structure:

```typescript
import { dark } from '@ariob/andromeda';

const custom = {
  ...dark,
  colors: {
    ...dark.colors,
    accent: '#FF6B6B', // Custom accent color
  },
};

// Register in unistyles.config.ts
const appThemes = { dark, light, custom };
```
