# Setup

Installation and configuration guide for @ariob/andromeda.

---

## Installation

```bash
# In the monorepo
pnpm add @ariob/andromeda

# Peer dependencies
pnpm add react-native-unistyles react-native-reanimated expo-haptics @expo/vector-icons
```

---

## Unistyles Configuration

### 1. Create the config file

Create `unistyles.config.ts` at your app root:

```typescript
import { StyleSheet } from 'react-native-unistyles';
import { dark, light } from '@ariob/andromeda';

// Define your app themes
const appThemes = {
  dark,
  light,
};

// Define breakpoints
const appBreakpoints = {
  xs: 0,
  sm: 360,
  md: 768,
  lg: 1024,
  xl: 1440,
};

// Settings
const appSettings = {
  // Enable automatic dark/light mode based on system preference
  adaptiveThemes: true,
  // Enable CSS variable generation for web
  CSSVars: true,
};

// Type augmentation for TypeScript
type AppThemes = typeof appThemes;

declare module 'react-native-unistyles' {
  export interface UnistylesThemes extends AppThemes {}
}

// Configure Unistyles
StyleSheet.configure({
  themes: appThemes,
  breakpoints: appBreakpoints,
  settings: appSettings,
});
```

### 2. Import in your root layout

```typescript
// app/_layout.tsx (Expo Router)
import '../unistyles.config'; // Must be first!
import { Stack } from 'expo-router';

export default function RootLayout() {
  return <Stack />;
}
```

---

## Configuration Options

### Theme Settings

| Option | Type | Description |
|--------|------|-------------|
| `adaptiveThemes` | `boolean` | Auto-switch based on system preference |
| `initialTheme` | `string` | Force a specific theme (conflicts with `adaptiveThemes`) |
| `CSSVars` | `boolean` | Generate CSS variables for web |

> **Important:** `adaptiveThemes` and `initialTheme` are mutually exclusive. Use one or the other.

### Breakpoints

Default breakpoints follow common device sizes:

```typescript
const breakpoints = {
  xs: 0,      // Small phones
  sm: 360,    // Standard phones
  md: 768,    // Tablets
  lg: 1024,   // Small desktops
  xl: 1440,   // Large desktops
};
```

---

## TypeScript Setup

Add type declarations to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": ["react-native-unistyles"]
  }
}
```

---

## Theme Initialization Order

The theme must be configured before any `StyleSheet.create()` calls:

```
1. unistyles.config.ts → StyleSheet.configure()
2. Root _layout.tsx → import '../unistyles.config'
3. Components render → StyleSheet.create() works
```

### Incorrect Order (Causes Errors)

```typescript
// ❌ Wrong: Component imports before config
import { MyComponent } from './MyComponent'; // Uses StyleSheet.create internally
import '../unistyles.config';
```

### Correct Order

```typescript
// ✅ Correct: Config first, then components
import '../unistyles.config';
import { MyComponent } from './MyComponent';
```

---

## Using with Expo Router

### Root Layout

```typescript
// app/_layout.tsx
import 'react-native-get-random-values';
import '../unistyles.config';

import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ToastProvider, ToastContainer } from '@ariob/andromeda';
import { useUnistyles } from 'react-native-unistyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RootLayout() {
  const { theme } = useUnistyles();
  const insets = useSafeAreaInsets();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ToastProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: theme.colors.bg },
            }}
          />
          <ToastContainer topInset={insets.top} />
        </ToastProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
```

---

## Verifying Setup

Create a test component to verify everything works:

```typescript
import { View } from 'react-native';
import { Text, Button } from '@ariob/andromeda';
import { useUnistyles } from 'react-native-unistyles';

export function SetupTest() {
  const { theme, themeName } = useUnistyles();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg, padding: 20 }}>
      <Text size="title">Andromeda Setup Test</Text>
      <Text size="body" color="dim">Current theme: {themeName}</Text>
      <Button onPress={() => console.log('Works!')}>
        Test Button
      </Button>
    </View>
  );
}
```

If you see styled text and a themed button, setup is complete!

---

## Next Steps

- [Theme System](./THEME.md) - Learn about design tokens
- [Atoms](./ATOMS.md) - Start using components
