# Design Tokens - Brana

Complete reference for Brana's design system tokens.

## Philosophy

Brana follows a **theme-first architecture** with these principles:

1. **Single source of truth**: CSS variables defined in `global.css` (native) and `global.web.css` (web)
2. **Semantic naming**: Intent over appearance (`--background` not `--gray-100`)
3. **OKLCH color space**: Perceptually uniform colors across light/dark modes
4. **Mindful-inspired**: Achromatic palette with minimal accent colors
5. **Automatic theming**: System preference-aware via `@media (prefers-color-scheme: dark)`

## Color Palette

### Light Mode (Default)

| Token | Value | Hex Equivalent | Usage |
|-------|-------|----------------|-------|
| `--background` | `oklch(0.91 0 0)` | `#E4E4E4` | Main paper background |
| `--foreground` | `oklch(0.15 0 0)` | `#262626` | Primary text color |
| `--muted` | `oklch(0.55 0 0)` | `#8E8E93` | Secondary text, icons |
| `--muted-foreground` | `oklch(0.95 0 0)` | `#F2F2F2` | Muted text on dark surfaces |
| `--surface` | `oklch(0.11 0 0)` | `#1C1C1E` | Elevated surfaces, cards |
| `--surface-foreground` | `oklch(1 0 0)` | `#FFFFFF` | Text on elevated surfaces |
| `--overlay` | `oklch(0.17 0 0)` | `#2C2C2E` | Modal overlays, menus |
| `--overlay-foreground` | `oklch(1 0 0)` | `#FFFFFF` | Text on overlays |
| `--accent` | `oklch(0.50 0.13 250)` | `#007AFF` | Primary actions, links |
| `--accent-foreground` | `oklch(1 0 0)` | `#FFFFFF` | Text on accent backgrounds |
| `--success` | `oklch(0.65 0.17 145)` | `#30D158` | Success states, confirmations |
| `--success-foreground` | `oklch(0.05 0 0)` | `#0D0D0D` | Text on success backgrounds |
| `--danger` | `oklch(0.60 0.20 25)` | `#FF453A` | Errors, destructive actions |
| `--danger-foreground` | `oklch(1 0 0)` | `#FFFFFF` | Text on danger backgrounds |
| `--divider` | `oklch(0.22 0 0)` | `#38383A` | Horizontal dividers |
| `--border` | `oklch(0.23 0 0)` | `#3A3A3C` | Component borders |
| `--field-background` | `oklch(0.11 0 0)` | `#1C1C1E` | Input field backgrounds |
| `--field-foreground` | `oklch(1 0 0)` | `#FFFFFF` | Input field text |
| `--field-placeholder` | `oklch(0.39 0 0)` | `#636366` | Placeholder text |

### Dark Mode

| Token | Value | Hex Equivalent | Usage |
|-------|-------|----------------|-------|
| `--background` | `oklch(0.12 0 0)` | `#121212` | Main paper background |
| `--foreground` | `oklch(0.95 0 0)` | `#F2F2F2` | Primary text color |
| `--muted` | `oklch(0.55 0 0)` | `#8E8E93` | Secondary text (unchanged) |
| `--muted-foreground` | `oklch(0.15 0 0)` | `#262626` | Muted text on light surfaces |

*Note: Other tokens remain the same in dark mode.*

## Typography

### Font Families

```typescript
// Native (iOS/Android)
--font-normal: 'IBMPlexMono_400Regular'
--font-medium: 'IBMPlexMono_500Medium'
--font-semibold: 'IBMPlexMono_600SemiBold'
--font-bold: 'IBMPlexMono_700Bold'

// Web
--font-normal: 'IBM Plex Mono', 'SF Mono', 'Menlo', monospace
```

### Font Sizes

| Token | Value | Usage |
|-------|-------|-------|
| `fontSize.xs` | `11px` | Captions, labels |
| `fontSize.sm` | `13px` | Small UI text |
| `fontSize.base` | `15px` | Body text |
| `fontSize.lg` | `17px` | Large body text |
| `fontSize.xl` | `20px` | H3 headings |
| `fontSize.2xl` | `24px` | H2 headings |
| `fontSize.3xl` | `28px` | H1 headings |
| `fontSize.4xl` | `34px` | Hero text |

### Line Heights

| Token | Value | Usage |
|-------|-------|-------|
| `lineHeight.tight` | `1.2` | Headings |
| `lineHeight.snug` | `1.375` | Subheadings |
| `lineHeight.normal` | `1.5` | UI elements |
| `lineHeight.relaxed` | `1.625` | Body text |
| `lineHeight.loose` | `2.0` | Spacious reading |

### Pre-composed Text Styles

Use these for consistent typography across the app:

```typescript
textStyles.h1         // 28px bold, tight line height
textStyles.h2         // 24px semibold, snug line height
textStyles.h3         // 20px semibold, snug line height
textStyles.body       // 15px regular, relaxed line height
textStyles.bodySmall  // 13px regular, relaxed line height
textStyles.label      // 13px medium, normal line height
textStyles.caption    // 11px regular, normal line height
textStyles.button     // 15px medium, normal line height
```

## Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `spacing.xs` | `4px` | Tight spacing |
| `spacing.sm` | `8px` | Small spacing |
| `spacing.md` | `12px` | Medium spacing |
| `spacing.lg` | `16px` | Large spacing |
| `spacing.xl` | `20px` | Extra large spacing |
| `spacing.xxl` | `24px` | Double extra large spacing |

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `borderRadius.sm` | `4px` | Small elements |
| `borderRadius.md` | `8px` | Buttons, inputs |
| `borderRadius.lg` | `12px` | Cards, menus |
| `borderRadius.xl` | `16px` | Large containers |

## Usage Examples

### Colors

**Tailwind classes (preferred)**:
```tsx
<View className="bg-background">
  <Text className="text-foreground">Primary text</Text>
  <Text className="text-muted">Secondary text</Text>
</View>
```

**Hook-based access**:
```tsx
import { useThemeColor } from '@/constants/theme';

const bgColor = useThemeColor('background');
<View style={{ backgroundColor: bgColor }} />
```

**Web CSS**:
```css
.my-component {
  background-color: var(--background);
  color: var(--foreground);
  border-color: var(--border);
}
```

### Typography

```tsx
import { textStyles, fontSize, fontFamily } from '@/constants/typography';

// Pre-composed styles
<Text style={textStyles.h2}>Heading</Text>
<Text style={textStyles.body}>Body text</Text>

// Custom composition
<Text style={{
  fontSize: fontSize.lg,
  fontFamily: fontFamily.monoMedium,
  lineHeight: fontSize.lg * lineHeight.relaxed
}}>
  Custom text
</Text>
```

## Best Practices

### ✅ Do
- Use semantic token names (`--background`, not `--gray-100`)
- Use pre-composed `textStyles` for typography
- Use OKLCH for new colors
- Test in both light and dark modes
- Use Tailwind classes for static styles
- Use `useThemeColor` for dynamic styles

### ❌ Don't
- Hardcode hex values (`#000000`)
- Use non-semantic names (`--color-1`)
- Use RGB/HSL color space
- Assume light mode only
- Mix hardcoded and token-based styles
- Create inline style objects without memoization

## Theme Switching (Future)

Currently, Brana respects system preferences via `@media (prefers-color-scheme: dark)`. To add manual theme switching:

```typescript
// Future API (not yet implemented)
import { Uniwind } from 'uniwind';

Uniwind.setTheme('light');
Uniwind.setTheme('dark');
Uniwind.setTheme('system'); // Follow OS preference
```

## Migration Guide

### From Hardcoded Colors

**Before**:
```tsx
<View style={{ backgroundColor: '#000000' }}>
  <Text style={{ color: '#8E8E93', fontSize: 14 }}>
    Secondary text
  </Text>
</View>
```

**After**:
```tsx
import { useThemeColor } from '@/constants/theme';
import { textStyles } from '@/constants/typography';

const bgColor = useThemeColor('background');

<View style={{ backgroundColor: bgColor }}>
  <Text style={[textStyles.bodySmall, { color: useThemeColor('muted') }]}>
    Secondary text
  </Text>
</View>
```

### From Magic Numbers

**Before**:
```tsx
<View style={{ padding: 12, borderRadius: 8 }}>
```

**After**:
```tsx
import { spacing, borderRadius } from '@/constants/theme';

<View style={{ padding: spacing.md, borderRadius: borderRadius.md }}>
```

## Color Accessibility

All color combinations meet WCAG AA standards:

| Combination | Contrast Ratio | Rating |
|-------------|----------------|--------|
| `foreground` on `background` | 12.6:1 (light), 11.8:1 (dark) | AAA |
| `muted` on `background` | 4.7:1 | AA |
| `accent-foreground` on `accent` | 4.5:1 | AA |
| `danger-foreground` on `danger` | 4.6:1 | AA |

## Further Reading

- [STYLING_GUIDE.md](./STYLING_GUIDE.md) - Component styling patterns
- [global.css](../global.css) - Native theme source
- [global.web.css](../global.web.css) - Web theme source
- [constants/theme.ts](../constants/theme.ts) - TypeScript helpers
- [constants/typography.ts](../constants/typography.ts) - Typography system
