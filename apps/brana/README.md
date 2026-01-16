# Brana - Notes Editor

> Minimalist rich-text editor for focused writing

Brana is a cross-platform note-taking app built with Expo and TipTap, designed with Mindful's philosophy of radical simplicity and distraction-free writing.

## Quick Start

```bash
# Install dependencies (from monorepo root)
pnpm install

# Start development server
cd apps/brana
pnpm start

# Platform-specific
pnpm ios      # iOS simulator
pnpm android  # Android emulator
pnpm web      # Web browser
```

## Architecture

### Platform Strategy
- **Web**: TipTap editor with full rich-text features
- **Native (iOS/Android)**: TipTap in WebView via Expo DOM for consistent editing experience

### Directory Structure
```
apps/brana/
├── app/                    # Expo Router pages
│   ├── _layout.tsx        # Root layout with theme providers
│   ├── index.tsx          # Main editor screen (native)
│   ├── editor.tsx         # Native editor wrapper
│   ├── editor.web.tsx     # Web TipTap editor
│   ├── archive.tsx        # Paper archive (native)
│   ├── settings.tsx       # Settings screen (native)
│   ├── archive.web.tsx    # Paper archive (web)
│   └── settings.web.tsx   # Settings screen (web)
├── components/            # Reusable UI components
│   ├── icons/            # Unified FontAwesome6 icons
│   ├── menus/            # Block and selection menus
│   ├── indicators/       # Visual indicators
│   └── toolbar/          # Native toolbar components
├── hooks/                # Custom React hooks
├── types/                # TypeScript interfaces
├── utils/                # Shared utilities
├── constants/            # Design tokens and configuration
│   ├── theme.ts         # Color system and spacing
│   ├── typography.ts    # Font styles and scales
│   ├── menuCommands.ts  # Menu command definitions
│   ├── welcomeContent.ts        # Native welcome (touch-focused)
│   └── welcomeContent.web.ts    # Web welcome (keyboard-focused)
├── global.css           # Native styles (Uniwind + CSS variables)
└── global.web.css       # Web styles (CSS variables + ProseMirror)
```

### Design System

Brana uses a **theme-first design system** built on CSS custom properties and OKLCH color space for perceptual uniformity across light and dark modes.

#### Color System
- **Single source of truth**: CSS variables in `global.css` and `global.web.css`
- **Semantic naming**: `--background`, `--foreground`, `--accent` (not primary/secondary)
- **OKLCH color space**: Perceptually uniform colors
- **Mindful-inspired palette**: Achromatic with minimal accent colors
  - Light mode: `#E4E4E4` paper, `#15...` text
  - Dark mode: `#121212` paper, `#F2...` text

#### Typography
- **Font**: IBM Plex Mono (400, 500, 600, 700 weights)
- **Pre-composed styles**: `textStyles.h1`, `textStyles.body`, etc.
- **Platform-aware**: Automatically selects correct font names for iOS/Android/Web

#### Usage Patterns

**Preferred: Tailwind classes with semantic names**
```tsx
<View className="bg-background">
  <Text className="text-foreground">Primary text</Text>
  <Text className="text-muted">Secondary text</Text>
</View>
```

**Alternative: Hook-based access for dynamic colors**
```tsx
import { useThemeColor } from '@/constants/theme';

const bgColor = useThemeColor('background');
<View style={{ backgroundColor: bgColor }} />
```

**Typography: Use textStyles constants**
```tsx
import { textStyles } from '@/constants/typography';

<Text style={textStyles.h2}>Heading</Text>
<Text style={textStyles.body}>Body text</Text>
```

See [DESIGN_TOKENS.md](./docs/DESIGN_TOKENS.md) for complete color reference.

## Development

### Adding New Colors
1. Add to `:root` in `global.css` (native) and `global.web.css` (web)
2. Use OKLCH color space for consistency
3. Follow semantic naming conventions
4. Add both light and dark mode values

### Adding New Components
See [STYLING_GUIDE.md](./docs/STYLING_GUIDE.md) for component styling patterns.

## Deployment

### Web (Vercel)
```bash
expo export -p web
```
Output: `dist/` directory with static files

Configuration: `vercel.json`
- Aggressive caching for static assets (1 year)
- SPA rewrites to `/index.html`

### Native (EAS)
```bash
# iOS Preview
eas build --platform ios --profile preview

# Android Preview
eas build --platform android --profile preview

# Production
eas build --platform all --profile production
```

Configuration: `eas.json`
- Monorepo support with pnpm
- Three profiles: development, preview, production
- Auto-increment versioning

## Design Philosophy

Inspired by [Mindful](https://mindful.sh/):
- **Radical simplicity** - Typography-first design
- **Keyboard-first** (web) / **Touch-first** (native)
- **Invisible when not needed** - Hidden UI, appearing on interaction
- **Minimal color usage** - Achromatic palette with subtle accents
- **Zero friction** - No organizational overhead, immediate writing

## Key Features

- **Cross-platform**: iOS, Android, and Web with shared codebase
- **Rich text editing**: Powered by TipTap with Markdown-like shortcuts
- **Paper-based organization**: Multiple documents ("papers") with archive
- **Automatic saving**: All content persisted to AsyncStorage (native) or LocalStorage (web)
- **Dark mode**: System preference-aware theming
- **Keyboard shortcuts**: Extensive shortcuts for efficient editing (web)
- **Touch gestures**: Two-finger swipe for undo/redo (native)

## Contributing

See [CLAUDE.md](./CLAUDE.md) for detailed architecture documentation and development guidelines.

## License

Proprietary - Ariob Studio
