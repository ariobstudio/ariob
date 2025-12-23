# Styles

Theme tokens and effects for @ariob/ripple.

---

## Overview

Ripple provides a complete theme system with:
- **Color palettes** for dark and light modes (iOS-inspired)
- **Spacing scale** for consistent layout
- **Border radii** for rounded corners
- **Typography** scale for text
- **Effects** for shadows, glows, and overlays
- **Spring presets** for animations
- **Andromeda compatibility** aliases for seamless integration

---

## Importing

```typescript
// Full themes
import { rippleThemes } from '@ariob/ripple/styles';

// Individual tokens
import {
  ripplePalettes,
  rippleSpacing,
  rippleRadii,
  rippleTypography,
  rippleEffects,
  rippleSprings,
  rippleBreakpoints,
  createRippleTheme,
} from '@ariob/ripple/styles';

// Theme types
import type { RippleTheme, RippleThemeMode, RipplePalette } from '@ariob/ripple/styles';
```

---

## Color Palette

iOS-inspired color system with Andromeda compatibility aliases.

### Base Colors

| Token | Dark | Light | Usage |
|-------|------|-------|-------|
| `background` | `#000000` | `#F5F5F7` | App background |
| `surface` | `#1C1C1E` | `#FFFFFF` | Card surfaces |
| `surfaceElevated` | `#2C2C2E` | `#FFFFFF` | Elevated surfaces |
| `surfaceMuted` | `#151517` | `#F2F2F7` | Muted backgrounds |
| `overlay` | `rgba(0,0,0,0.7)` | `rgba(0,0,0,0.4)` | Modal overlays |

### Border Colors

| Token | Dark | Light |
|-------|------|-------|
| `borderSubtle` | `rgba(255,255,255,0.08)` | `rgba(0,0,0,0.03)` |
| `border` | `rgba(255,255,255,0.12)` | `rgba(0,0,0,0.05)` |
| `borderStrong` | `rgba(255,255,255,0.2)` | `rgba(0,0,0,0.12)` |

### Text Colors

| Token | Dark | Light | Usage |
|-------|------|-------|-------|
| `text` | `#F5F5F7` | `#1D1D1F` | Primary text (alias) |
| `textPrimary` | `#F5F5F7` | `#1D1D1F` | Primary text |
| `textSecondary` | `#98989D` | `#86868B` | Secondary text |
| `textMuted` | `#636366` | `#AEAEB2` | Muted text |
| `textTertiary` | `#636366` | `#AEAEB2` | Tertiary (alias) |

### Semantic Colors

| Token | Dark | Light | Usage |
|-------|------|-------|-------|
| `accent` | `#0A84FF` | `#0071E3` | Primary actions |
| `accentSoft` | `rgba(10,132,255,0.15)` | `rgba(0,113,227,0.1)` | Soft accent backgrounds |
| `accentGlow` | `rgba(10,132,255,0.3)` | `rgba(0,113,227,0.2)` | Glow effects |
| `success` | `#30D158` | `#34C759` | Success states |
| `warning` | `#FFD60A` | `#FF9F0A` | Warning states |
| `danger` | `#FF453A` | `#FF3B30` | Error/destructive |
| `info` | `#5E5CE6` | `#5856D6` | Informational |
| `glass` | `rgba(30,30,30,0.8)` | `rgba(255,255,255,0.85)` | Glassmorphism |

### Glow Colors

```typescript
theme.colors.glow = {
  cyan: '#64D2FF',  // Dark: #64D2FF, Light: #5AC8FA
  teal: '#6AC4DC',  // Dark: #6AC4DC, Light: #30B0C7
  blue: '#409CFF',  // Dark: #409CFF, Light: #007AFF
}
```

### Degree Colors

Colors representing social proximity:

| Degree | Name | Dark | Light |
|--------|------|------|-------|
| 0 | Me | `#FF375F` | `#FF2D55` |
| 1 | Friends | `#64D2FF` | `#5AC8FA` |
| 2 | World | `#BF5AF2` | `#AF52DE` |
| 3 | Discover | `#FFD60A` | `#FFCC00` |
| 4 | Noise | `#8E8E93` | `#8E8E93` |

```typescript
// Access degree colors
theme.colors.degree[0] // Me
theme.colors.degree[1] // Friends
theme.colors.degree[2] // World
theme.colors.degree[3] // Discover
theme.colors.degree[4] // Noise
```

### Indicator Colors

Content type indicators:

| Type | Dark | Light | Usage |
|------|------|-------|-------|
| `profile` | `#30D158` | `#34C759` | Profile nodes |
| `message` | `#0A84FF` | `#007AFF` | Message nodes |
| `auth` | `#5E5CE6` | `#5856D6` | Auth nodes |
| `ai` | `#FF9F0A` | `#FF9500` | AI-related |
| `post` | `#F5F5F7` | `#1D1D1F` | Post nodes |

```typescript
// Access indicator colors
theme.colors.indicator.profile
theme.colors.indicator.message
theme.colors.indicator.ai
```

### Andromeda Compatibility Aliases

These aliases ensure compatibility with @ariob/andromeda components:

| Alias | Maps To | Usage |
|-------|---------|-------|
| `bg` | `background` | Background shorthand |
| `elevated` | `surfaceElevated` | Elevated surface shorthand |
| `muted` | `surfaceMuted` | Muted surface shorthand |
| `dim` | `textSecondary` | Secondary text shorthand |
| `faint` | `textMuted` | Muted text shorthand |
| `warn` | `warning` | Warning color shorthand |

---

## Spacing Scale

```typescript
rippleSpacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 40,
}
```

### Usage

```typescript
const { theme } = useUnistyles();

// In styles
const styles = createStyleSheet((theme) => ({
  container: {
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    marginVertical: theme.spacing.xs,
  },
}));
```

---

## Border Radii

```typescript
rippleRadii = {
  sm: 8,     // Small elements, buttons
  md: 16,    // Cards, inputs
  lg: 24,    // Large cards
  xl: 32,    // Modals
  pill: 999, // Fully rounded
}
```

### Usage

```typescript
const styles = createStyleSheet((theme) => ({
  card: {
    borderRadius: theme.radii.md,
  },
  avatar: {
    borderRadius: theme.radii.pill,
  },
  button: {
    borderRadius: theme.radii.sm,
  },
}));
```

---

## Typography

```typescript
rippleTypography = {
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  heading: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  caption: {
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: 0,
  },
  mono: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0,
  },
}
```

### Usage

```typescript
const styles = createStyleSheet((theme) => ({
  title: {
    ...theme.typography.title,
    color: theme.colors.textPrimary,
  },
  body: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
}));
```

---

## Effects

### Divider Effects

```typescript
rippleEffects.divider = {
  subtle: 'rgba(0,0,0,0.05)',
  strong: 'rgba(0,0,0,0.1)',
}
```

### Outline Effects

```typescript
rippleEffects.outline = {
  focus: 'rgba(0,113,227,0.4)',   // Focus ring
  glow: 'rgba(90,200,250,0.3)',   // Cyan glow outline
}
```

### Glow Effects

```typescript
rippleEffects.glow = {
  accent: 'rgba(0,113,227,0.2)',
  cyan: 'rgba(90,200,250,0.25)',
  success: 'rgba(52,199,89,0.2)',
  danger: 'rgba(255,59,48,0.2)',
}
```

### Shadow Presets

```typescript
rippleEffects.shadow = {
  // Primary naming (Ripple)
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  strong: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
  },
  glow: {
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  // Andromeda compatibility aliases
  sm: /* same as subtle */,
  md: /* same as medium */,
  lg: /* same as strong */,
}
```

### Usage

```typescript
const styles = createStyleSheet((theme) => ({
  elevatedCard: {
    ...theme.effects.shadow.medium,
    backgroundColor: theme.colors.surface,
  },
  glowingElement: {
    ...theme.effects.shadow.glow,
    backgroundColor: theme.colors.accent,
  },
}));
```

---

## Spring Presets

```typescript
rippleSprings = {
  snappy: { damping: 20, stiffness: 300, mass: 0.5 },  // Quick taps, button presses
  smooth: { damping: 30, stiffness: 350, mass: 1 },    // Standard - Apple style
  bouncy: { damping: 15, stiffness: 200, mass: 1 },    // Playful interactions
  gentle: { damping: 25, stiffness: 120, mass: 1 },    // Slow reveals, modals
}
```

### Usage with Reanimated

```typescript
import { withSpring } from 'react-native-reanimated';

// Using theme springs
const animatedValue = withSpring(target, theme.springs.snappy);

// Or directly
const animatedValue = withSpring(target, rippleSprings.bouncy);
```

---

## Breakpoints

```typescript
rippleBreakpoints = {
  xs: 0,
  sm: 360,
  md: 768,
  lg: 1024,
  xl: 1440,
}
```

### Usage

```typescript
const styles = createStyleSheet((theme) => ({
  grid: {
    flexDirection: {
      xs: 'column',
      md: 'row',
    },
  },
}));
```

---

## Complete Theme Type

```typescript
interface RippleTheme {
  colors: RipplePalette;
  spacing: typeof rippleSpacing;
  radii: typeof rippleRadii;
  typography: typeof rippleTypography;
  effects: typeof rippleEffects;
  springs: typeof rippleSprings;
  // Andromeda compatibility aliases
  space: typeof rippleSpacing;
  shadow: typeof rippleEffects.shadow;
}

type RippleThemeMode = 'dark' | 'light';

// Access themes
rippleThemes.dark  // RippleTheme
rippleThemes.light // RippleTheme
```

---

## Creating Custom Themes

```typescript
import { createRippleTheme, ripplePalettes } from '@ariob/ripple/styles';

// Extend existing palette
const customDarkPalette: RipplePalette = {
  ...ripplePalettes.dark,
  accent: '#FF6B6B', // Custom accent
};

// Create theme
const customTheme: RippleTheme = {
  ...createRippleTheme('dark'),
  colors: customDarkPalette,
};

// Use in Unistyles config
import { UnistylesRegistry } from 'react-native-unistyles';

UnistylesRegistry
  .addThemes({
    dark: rippleThemes.dark,
    light: rippleThemes.light,
    custom: customTheme,
  })
  .addBreakpoints(rippleBreakpoints)
  .addConfig({
    adaptiveThemes: true,
  });
```

---

## Related Documentation

- [Setup](./SETUP.md) - Unistyles configuration
- [Architecture](./ARCHITECTURE.md) - Design patterns
- [API Reference](./API.md) - Complete API
