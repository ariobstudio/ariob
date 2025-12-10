# Troubleshooting

Common issues and solutions for @ariob/ripple.

---

## Theme & Styling Errors

### "adaptiveThemes and initialTheme are mutually exclusive"

**Error:**
```
Error: Unistyles: You're trying to set initial theme and enable adaptiveThemes,
but these options are mutually exclusive.
```

**Cause:** Both settings are enabled in `unistyles.config.ts`.

**Solution:**
```typescript
// Choose ONE:

// Option 1: Adaptive (follows system)
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
but no theme has been selected yet.
```

**Cause:** StyleSheet.create() runs before StyleSheet.configure().

**Solution:** Import config before any components:

```typescript
// app/_layout.tsx
import '../unistyles.config'; // FIRST
import { Stack } from 'expo-router';
import { MyComponent } from './MyComponent'; // After config
```

---

### Style files detected as routes

**Warning:**
```
WARN Route "./styles/message.styles.ts" is missing the required default export.
```

**Cause:** Style files in `app/` directory are treated as routes.

**Solution:** Move styles outside `app/`:

```
// Before (wrong)
app/
  styles/
    message.styles.ts  ← Expo Router error

// After (correct)
styles/
  message.styles.ts
app/
  message/[id].tsx
```

Update imports:
```typescript
// From
import { styles } from '../styles/message.styles';

// To
import { styles } from '../../styles/message.styles';
```

---

## Action System Issues

### Actions not triggering

**Symptom:** Pressing action buttons does nothing.

**Check:**
1. `ActionsProvider` wraps your app
2. `onAction` handler is defined
3. Action names match configuration

```typescript
// Verify handler is called
const onAction = (action, context) => {
  console.log('Action triggered:', action, context);
  // ...
};

<ActionsProvider config={{ actions, feedConfig, nodeMenus, onAction }}>
```

---

### Context menu not appearing

**Symptom:** Long-press doesn't open menu.

**Check:**
1. `<Context />` is rendered in layout
2. Content is wrapped in `<Shell>`
3. `nodeMenus` config includes the node type

```typescript
// Layout
<ActionsProvider config={config}>
  <Stack />
  <Bar />
  <Context />  {/* Required! */}
</ActionsProvider>

// Content wrapper
<Shell nodeRef={{ id: item.id, type: 'post' }}>
  <Post data={item} />
</Shell>

// Config includes node type
const nodeMenus = createNodeMenus({
  post: { quick: ['reply'], detail: ['reply'], opts: ['report'] },
  // ...
});
```

---

### Bar not switching modes

**Symptom:** `bar.setMode()` doesn't change the bar.

**Check:**
```typescript
const bar = useBar();

// Verify mode change
useEffect(() => {
  console.log('Setting mode to input');
  bar.setMode('input');
}, []);

// Check callbacks are set
bar.setCallbacks({
  onSubmit: (text) => console.log('Submit:', text),
  onCancel: () => console.log('Cancel'),
});
```

---

## Navigation Issues

### useNodeNavigation not working

**Symptom:** Navigation methods don't navigate.

**Check:** Using Expo Router:

```typescript
// useNodeNavigation uses router internally
import { useNodeNavigation } from '@ariob/ripple';

const { toThread, toProfile } = useNodeNavigation();

// These use router.push internally
toThread('123'); // router.push('/thread/123')
toProfile('456'); // router.push('/user/456')
```

Ensure routes exist:
```
app/
  thread/
    [id].tsx    ← Required for toThread
  user/
    [id].tsx    ← Required for toProfile
  message/
    [id].tsx    ← Required for toMessage
```

---

### Back navigation fails

**Symptom:** `back()` crashes or doesn't work.

**Solution:** Check if can go back:

```typescript
import { useNavigation } from '@react-navigation/native';

const navigation = useNavigation();
const { back } = useNodeNavigation();

const handleBack = () => {
  if (navigation.canGoBack()) {
    back();
  } else {
    router.replace('/');
  }
};
```

---

## Feed Issues

### Feed not loading

**Symptom:** `useFeed` returns empty items.

**Check:**
1. Gun is initialized
2. Storage adapter is configured
3. Network peers are accessible

```typescript
// Verify Gun init
import { init } from '@ariob/core';

const gun = init({
  peers: ['https://gun-manhattan.herokuapp.com/gun'],
  store: {
    get: async (key, cb) => { /* ... */ },
    put: async (key, val, cb) => { /* ... */ },
  },
});

console.log('Gun initialized:', gun);
```

---

### Feed not updating

**Symptom:** New posts don't appear without refresh.

**Check:** Subscription is enabled:

```typescript
const { items } = useFeed({
  degree: 1,
  enabled: true,  // Must be true for real-time updates
});
```

---

## Gesture Issues

### Shell not responding to long-press

**Check:**
1. Content isn't intercepting touches
2. No `pointerEvents="none"` on parents
3. Gestures aren't disabled

```typescript
// Avoid blocking touches
<View pointerEvents="box-none">
  <Shell nodeRef={nodeRef}>
    <Content />
  </Shell>
</View>
```

---

### Swipe not triggering

**Check:**
1. Using GestureDetector correctly
2. Animated.View wraps content
3. Threshold is appropriate

```typescript
import { GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';

const gesture = useSwipe(nodeRef, {
  left: onDelete,
  right: onArchive,
  threshold: 80,  // Lower = more sensitive
});

<GestureDetector gesture={gesture}>
  <Animated.View>  {/* Must be Animated.View */}
    <Content />
  </Animated.View>
</GestureDetector>
```

---

## Performance Issues

### Slow feed rendering

**Solutions:**

1. Use `keyExtractor`:
```typescript
<FlatList
  data={items}
  keyExtractor={(item) => item.id}
  // ...
/>
```

2. Memoize items:
```typescript
const MemoizedPost = React.memo(Post);

<FlatList
  renderItem={({ item }) => <MemoizedPost data={item} />}
/>
```

3. Limit re-renders:
```typescript
const actionsConfig = useMemo(() => ({
  actions,
  feedConfig,
  nodeMenus,
  onAction,
}), []); // Empty deps = stable reference
```

---

### Memory leaks

**Symptom:** App slows down over time.

**Check:** Clean up subscriptions:

```typescript
useFocusEffect(
  useCallback(() => {
    // Setup
    bar.configure({ mode: 'input' });

    // Cleanup
    return () => {
      bar.configure({ persistInputMode: false });
      bar.setMode('actions');
    };
  }, [])
);
```

---

## TypeScript Issues

### Theme types not recognized

**Solution:** Add module augmentation:

```typescript
// unistyles.config.ts
import { rippleThemes } from '@ariob/ripple/styles';

type AppThemes = typeof rippleThemes;

declare module 'react-native-unistyles' {
  export interface UnistylesThemes extends AppThemes {}
}
```

---

### Action types missing

**Solution:** Import types:

```typescript
import type {
  Action,
  ActionsConfig,
  FeedConfig,
  NodeMenuConfig,
  ActionContext,
} from '@ariob/ripple';
```

---

## Debug Tips

### Log all actions

```typescript
const onAction = (action, context) => {
  console.log('=== ACTION ===');
  console.log('Action:', action);
  console.log('Context:', JSON.stringify(context, null, 2));
  // ... handle action
};
```

### Check theme values

```typescript
const { theme, themeName } = useUnistyles();
console.log('Theme:', themeName);
console.log('Accent:', theme.colors.accent);
console.log('Degree 1:', theme.colors.degree[1]);
```

### Verify node refs

```typescript
<Shell
  nodeRef={{ id: item.id, type: item.type }}
  onLongPress={() => {
    console.log('Long press on:', item.id, item.type);
  }}
>
  <Content />
</Shell>
```

---

## Getting Help

If still stuck:

1. Check source in `packages/ripple/src/`
2. Look at `apps/ripple/` for usage examples
3. Search monorepo issues
4. Ask in team chat with reproduction steps
