# Styles

Theme tokens and effects for @ariob/ripple.

---

## Overview

Ripple provides a complete theme system with:
- **Color palettes** for dark and light modes
- **Spacing scale** for consistent layout
- **Border radii** for rounded corners
- **Typography** scale for text
- **Effects** for shadows, glows, and overlays
- **Spring presets** for animations

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
} from '@ariob/ripple/styles';

// Theme type
import type { RippleTheme, RippleThemeMode } from '@ariob/ripple/styles';
```

---

## Color Palette

### Base Colors

| Token | Dark | Light | Usage |
|-------|------|-------|-------|
| `background` | `#000000` | `#F7F7FA` | App background |
| `surface` | `#0F1216` | `#FFFFFF` | Card surfaces |
| `surfaceElevated` | `#16181C` | `#F2F3F7` | Elevated surfaces |
| `surfaceMuted` | `#1F2226` | `#E8E9F0` | Muted backgrounds |
| `overlay` | `rgba(0,0,0,0.85)` | `rgba(247,247,250,0.9)` | Modal overlays |

### Border Colors

| Token | Dark | Light |
|-------|------|-------|
| `borderSubtle` | `rgba(255,255,255,0.04)` | `rgba(15,18,22,0.04)` |
| `border` | `rgba(255,255,255,0.08)` | `rgba(15,18,22,0.08)` |
| `borderStrong` | `rgba(255,255,255,0.15)` | `rgba(15,18,22,0.15)` |

### Text Colors

| Token | Dark | Light | Usage |
|-------|------|-------|-------|
| `text` | `#E7E9EA` | `#1F2125` | Primary text (alias) |
| `textPrimary` | `#E7E9EA` | `#1F2125` | Primary text |
| `textSecondary` | `#A0A4AA` | `#4A4D52` | Secondary text |
| `textMuted` | `#6B6F76` | `#6F737C` | Muted text |
| `textTertiary` | `#6B6F76` | `#6F737C` | Tertiary (alias) |

### Semantic Colors

| Token | Dark | Light | Usage |
|-------|------|-------|-------|
| `accent` | `#1D9BF0` | `#0A84FF` | Primary actions |
| `accentSoft` | `rgba(29,155,240,0.15)` | `rgba(10,132,255,0.15)` | Soft accent |
| `accentGlow` | `#00E5FF` | `#00B8D4` | Bioluminescent glow |
| `success` | `#00BA7C` | `#0A915E` | Success states |
| `warning` | `#F5A524` | `#CB8600` | Warning states |
| `danger` | `#F91880` | `#D7265E` | Error/destructive |
| `info` | `#7A7FFF` | `#3D5AFE` | Informational |
| `glass` | `rgba(16,18,22,0.9)` | `rgba(255,255,255,0.9)` | Glassmorphism |

### Degree Colors

Colors representing social proximity:

| Degree | Name | Dark | Light |
|--------|------|------|-------|
| 0 | Me | `#FF6B9D` | `#E91E63` |
| 1 | Friends | `#00E5FF` | `#00B8D4` |
| 2 | World | `#7C4DFF` | `#651FFF` |
| 3 | Discover | `#FFC107` | `#FF8F00` |
| 4 | Noise | `#78909C` | `#546E7A` |

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

| Type | Color | Usage |
|------|-------|-------|
| `profile` | `#00BA7C` | Profile nodes |
| `message` | `#1D9BF0` | Message nodes |
| `auth` | `#7856FF` | Auth nodes |
| `ai` | `#FACC15` | AI-related |
| `post` | `#E7E9EA` | Post nodes |

```typescript
// Access indicator colors
theme.colors.indicator.profile
theme.colors.indicator.message
theme.colors.indicator.ai
```

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
const styles = StyleSheet.create((theme) => ({
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
  sm: 6,    // Small elements
  md: 12,   // Cards, inputs
  lg: 18,   // Large cards
  xl: 24,   // Modals
  pill: 999, // Fully rounded
}
```

### Usage

```typescript
const styles = StyleSheet.create((theme) => ({
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
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  heading: {
    fontSize: 18,
    fontWeight: '600',
  },
  body: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500',
  },
  mono: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
}
```

### Usage

```typescript
const styles = StyleSheet.create((theme) => ({
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
  subtle: 'rgba(255,255,255,0.03)',
  strong: 'rgba(255,255,255,0.08)',
}
```

### Outline Effects

```typescript
rippleEffects.outline = {
  focus: 'rgba(29,155,240,0.45)',  // Focus ring
  glow: 'rgba(0,229,255,0.30)',    // Cyan glow outline
}
```

### Glow Effects

```typescript
rippleEffects.glow = {
  accent: 'rgba(29,155,240,0.35)',
  cyan: 'rgba(0,229,255,0.40)',    // Liquid Trust bioluminescence
  success: 'rgba(0,186,124,0.35)',
  danger: 'rgba(249,24,128,0.35)',
}
```

### Shadow Presets

```typescript
rippleEffects.shadow = {
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  strong: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  glow: {
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
}
```

### Usage

```typescript
const styles = StyleSheet.create((theme) => ({
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
  snappy: { damping: 25, stiffness: 300, mass: 0.6 },  // Quick taps
  smooth: { damping: 20, stiffness: 200, mass: 0.8 },  // Standard
  bouncy: { damping: 12, stiffness: 150, mass: 1.0 },  // Playful
  gentle: { damping: 16, stiffness: 120, mass: 1.0 },  // Slow reveals
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
const styles = StyleSheet.create((theme) => ({
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
const customDarkPalette = {
  ...ripplePalettes.dark,
  accent: '#FF6B6B', // Custom accent
};

// Create theme
const customTheme = {
  ...createRippleTheme('dark'),
  colors: customDarkPalette,
};

// Use in config
const appThemes = {
  dark: rippleThemes.dark,
  light: rippleThemes.light,
  custom: customTheme,
};
```
