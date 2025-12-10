# Troubleshooting

Common issues and solutions for @ariob/andromeda.

---

## Unistyles Errors

### "You're trying to set initial theme and enable adaptiveThemes"

**Error:**
```
Error: Unistyles: You're trying to set initial theme and enable adaptiveThemes,
but these options are mutually exclusive.
```

**Cause:** Setting both `adaptiveThemes: true` and `initialTheme` in the configuration.

**Solution:** Choose one approach:

```typescript
// Option 1: Adaptive themes (recommended)
const appSettings = {
  adaptiveThemes: true,
  CSSVars: true,
};

// Option 2: Fixed theme
const appSettings = {
  initialTheme: 'dark',
  CSSVars: true,
};
```

---

### "No theme has been selected yet"

**Error:**
```
Error: Unistyles: One of your stylesheets is trying to get the theme,
but no theme has been selected yet. Did you forget to select an initial theme?
```

**Cause:** `StyleSheet.create()` is called before `StyleSheet.configure()`.

**Solution:** Ensure the config import is first:

```typescript
// ✅ Correct order
import '../unistyles.config'; // Must be FIRST
import { MyComponent } from './MyComponent';

// ❌ Wrong order
import { MyComponent } from './MyComponent'; // StyleSheet.create runs here
import '../unistyles.config'; // Too late
```

---

### "Missing default export" warnings

**Error:**
```
WARN Route "./styles/message.styles.ts" is missing the required default export.
```

**Cause:** Style files inside the `app/` directory are detected as routes by Expo Router.

**Solution:** Move style files outside the `app/` directory:

```
// ❌ Wrong location
app/
  styles/
    message.styles.ts  ← Expo Router thinks this is a route

// ✅ Correct location
styles/
  message.styles.ts    ← Outside app/, not a route
app/
  message/[id].tsx
```

Update imports accordingly:
```typescript
// Before
import { styles } from '../styles/message.styles';

// After
import { styles } from '../../styles/message.styles';
```

---

## Theme Issues

### Theme not updating

**Symptom:** Theme doesn't change when system preference changes.

**Check:**
1. Ensure `adaptiveThemes: true` is set
2. Don't use `initialTheme` with adaptive themes
3. Components must use `useUnistyles()` hook, not static theme access

```typescript
// ❌ Won't update
const styles = StyleSheet.create({
  container: { backgroundColor: theme.get().colors.bg },
});

// ✅ Will update
const styles = StyleSheet.create((theme) => ({
  container: { backgroundColor: theme.colors.bg },
}));
```

---

### Colors not matching expected values

**Symptom:** Colors appear different than documented.

**Check:**
1. Verify you're using the correct theme (dark vs light)
2. Check for color overrides in your config
3. Ensure you're accessing the right color path

```typescript
const { theme, themeName } = useUnistyles();
console.log('Current theme:', themeName);
console.log('Accent color:', theme.colors.accent);
```

---

## Component Issues

### Button not responding to press

**Check:**
1. `onPress` is provided and is a function
2. Button is not `disabled`
3. Button is not `loading`
4. Parent view isn't intercepting touches

```typescript
// ❌ Won't work
<Button onPress={undefined}>Press</Button>
<Button disabled onPress={action}>Press</Button>

// ✅ Will work
<Button onPress={() => console.log('pressed')}>Press</Button>
```

---

### Input not updating

**Symptom:** Typing doesn't update the input value.

**Check:** Ensure you're using controlled component pattern correctly:

```typescript
// ❌ Value never updates
<Input value={text} onChangeText={(t) => {}} />

// ✅ Properly controlled
const [text, setText] = useState('');
<Input value={text} onChangeText={setText} />
```

---

### Toast not appearing

**Check:**
1. `ToastProvider` wraps your app
2. `ToastContainer` is rendered
3. Import `toast` from the correct location

```typescript
// Required setup in _layout.tsx
import { ToastProvider, ToastContainer } from '@ariob/andromeda';

<ToastProvider>
  <Stack />
  <ToastContainer topInset={insets.top} />
</ToastProvider>

// Usage
import { toast } from '@ariob/andromeda';
toast.success('It works!');
```

---

### Avatar not showing

**Check:**
1. Provide either `char` or `icon`
2. Character should be 1-2 letters
3. Icon name must be valid Ionicons name

```typescript
// ❌ Won't show anything
<Avatar />

// ✅ Will show
<Avatar char="JD" />
<Avatar icon="person" />
```

---

## Layout Issues

### Flex not working

**Symptom:** Children don't fill available space.

**Check:** Parent has explicit height or `flex: 1`:

```typescript
// ❌ Stack has no height
<View>
  <Stack style={{ flex: 1 }}>...</Stack>
</View>

// ✅ Parent has flex
<View style={{ flex: 1 }}>
  <Stack style={{ flex: 1 }}>...</Stack>
</View>
```

---

### Gap not applying

**Check:** Using valid gap value:

```typescript
// ❌ Invalid gap
<Row gap={16}>...</Row>
<Stack gap="medium">...</Stack>

// ✅ Valid gap
<Row gap="md">...</Row>
<Stack gap="lg">...</Stack>

// Valid values: 'none' | 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
```

---

## Animation Issues

### Animations not running

**Check:**
1. `react-native-reanimated` is properly installed
2. Babel plugin is configured
3. Using Animated components

```javascript
// babel.config.js
module.exports = {
  plugins: ['react-native-reanimated/plugin'],
};
```

---

### Flickering on mount

**Symptom:** Content flickers before animation starts.

**Solution:** Use `FadeEnter` with initial opacity:

```typescript
<FadeEnter>
  <Card>Won't flicker</Card>
</FadeEnter>
```

---

## TypeScript Issues

### Type errors with theme

**Error:**
```
Property 'colors' does not exist on type 'UnistylesThemes'
```

**Solution:** Add module augmentation in your config:

```typescript
// unistyles.config.ts
type AppThemes = typeof appThemes;

declare module 'react-native-unistyles' {
  export interface UnistylesThemes extends AppThemes {}
}
```

---

### Missing type exports

**Symptom:** Can't import types like `TextSize`, `ButtonVariant`.

**Solution:** Import from the package:

```typescript
import type {
  TextSize,
  TextColor,
  ButtonVariant,
  ButtonTint,
  ButtonSize,
} from '@ariob/andromeda';
```

---

## Performance Issues

### Slow renders

**Check:**
1. Memoize callbacks with `useCallback`
2. Memoize expensive computations with `useMemo`
3. Use `React.memo` for list items
4. Avoid inline styles when possible

```typescript
// ❌ Creates new object every render
<View style={{ padding: theme.space.md }}>

// ✅ Uses StyleSheet
const styles = StyleSheet.create((theme) => ({
  container: { padding: theme.space.md },
}));
<View style={styles.container}>
```

---

### Memory leaks with toast

**Check:** Dismiss toasts when component unmounts:

```typescript
useEffect(() => {
  return () => {
    // Clean up on unmount if needed
  };
}, []);
```

---

## Getting Help

If you're still stuck:

1. Check the component's prop types in your IDE
2. Look at the source code in `packages/andromeda/src`
3. Search existing issues in the monorepo
4. Ask in the team chat with a minimal reproduction
