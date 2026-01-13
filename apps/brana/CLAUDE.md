# Brana - Notes Editor

## Overview

Brana is a cross-platform rich text editor built with Expo and TipTap. It supports web and native (iOS/Android) platforms with a focus on minimalist, distraction-free writing.

## Architecture

```
apps/brana/
├── app/                    # Expo Router pages
│   ├── _layout.tsx        # Root layout with providers
│   ├── index.tsx          # Main editor screen
│   ├── editor.tsx         # Native editor wrapper
│   └── editor.web.tsx     # Web editor (TipTap)
├── components/
│   ├── icons/             # Unified cross-platform icons
│   │   ├── Icon.tsx       # FontAwesome6 wrapper
│   │   ├── types.ts       # Icon types
│   │   └── index.ts
│   ├── menus/             # Block and selection menus
│   │   ├── BlockMenu.web.tsx
│   │   ├── SelectionMenu.web.tsx
│   │   ├── MenuButton.tsx
│   │   ├── types.ts
│   │   └── index.ts
│   ├── indicators/        # Visual indicators
│   │   ├── BlockIndicator.tsx
│   │   └── index.ts
│   ├── toolbar/           # Native toolbar
│   │   ├── EditorToolbar.tsx
│   │   └── ToolbarIconButton.tsx
│   └── index.ts
├── hooks/                  # Custom React hooks
│   ├── useBlockInfo.ts    # Block position/context
│   ├── useMenuPosition.ts # Menu viewport clamping
│   ├── useMenuNavigation.ts # Keyboard navigation
│   └── index.ts
├── types/                  # TypeScript interfaces
│   ├── editor.ts          # EditorState, EditorCommand
│   └── paper.ts           # Paper data types
├── utils/                  # Shared utilities
│   ├── editor.ts          # extractEditorState, executeCommand
│   └── storage.ts         # AsyncStorage persistence
├── constants/              # Configuration
│   ├── menuCommands.ts    # Menu command definitions
│   ├── placeholders.ts    # Editor placeholders
│   ├── theme.ts           # Design tokens
│   └── typography.ts      # Font styles
├── global.css             # Native styles (Tailwind)
└── global.web.css         # Web styles
```

## Key Patterns

### Platform-Specific Files
- `.web.tsx` - Web-only components
- `.native.tsx` - Native-only components
- `.tsx` - Cross-platform or auto-resolved

### Unified Icon System
Uses `@expo/vector-icons` (FontAwesome6) for both web and native:
```tsx
import { Icon } from '../components/icons';
<Icon name="bold" size="md" color="currentColor" />
```

### Command Pattern
All editor actions use typed commands:
```typescript
type EditorCommand =
  | { type: 'toggleBold' }
  | { type: 'setHeading'; level: 1 | 2 }
  | { type: 'toggleBulletList' };
```

### Hooks
- `useBlockInfo` - Tracks current block position/context using TipTap NodePos API with scroll support
- `useMenuPosition` - Clamps menu within viewport with flip and centering options
- Uses TipTap's NodePos API for accurate positioning that respects document scrolling

## Dependencies

| Category | Package |
|----------|---------|
| Editor | @tiptap/react, @tiptap/starter-kit |
| Animation | motion (web), react-native-reanimated (native) |
| Icons | @expo/vector-icons |
| Styling | tailwindcss, uniwind, @heroui |
| Storage | @react-native-async-storage/async-storage |

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm start

# TypeScript check
pnpm exec tsc --noEmit
```

## Recent Updates (2026-01-12)

### Bug Fixes
- **Fixed floating menu positioning**: Now uses TipTap's NodePos API for accurate positioning that respects document scrolling
- **Block indicator scrolls with content**: Both indicator and floating menu now track the cursor position correctly

### UI Improvements
- **Rounded menus**: Increased border-radius from 6px to 12px for a softer, more modern look
- **Mobile typography**: Adjusted font size to 19px and line-height to 1.48 for better readability on mobile devices
- **Button corners**: Menu buttons now have 8px border-radius for consistency

### Features
- **Back-to-main navigation**: Added "More" option (ellipsis icon) in list menus to access all block formatting options
- **Escape key behavior**: When viewing all blocks from a list context, Escape returns to list menu instead of closing entirely

### Code Organization
- **Extracted menu components**: BlockMenu and SelectionMenu are now modular components in `components/menus/`
- **Extracted hooks**: useBlockInfo and useMenuPosition are now in `hooks/` folder
- **Extracted indicators**: BlockIndicator is now a reusable component in `components/indicators/`
- **Unified icons**: All icons now use @expo/vector-icons (FontAwesome6) for cross-platform consistency

## Important Files

| File | Description |
|------|-------------|
| `types/editor.ts` | Core EditorState and EditorCommand types |
| `utils/editor.ts` | extractEditorState, executeCommand functions |
| `constants/menuCommands.ts` | Menu command definitions with unified icon names |
| `components/icons/` | Cross-platform icon component using @expo/vector-icons |
| `components/menus/` | Modular menu components (BlockMenu, SelectionMenu) |
| `components/indicators/` | Visual indicators (BlockIndicator) |
| `hooks/useBlockInfo.ts` | Block position detection hook using NodePos API |
| `hooks/useMenuPosition.ts` | Menu viewport clamping with flip/center options |
