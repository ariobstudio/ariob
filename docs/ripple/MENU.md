# Bar System

Stack-based action bar with smooth morphing animations.

---

## Overview

The Bar is a **global singleton** that maintains a stack of frames. Each frame can be:
- **Action**: Compact pill with action buttons
- **Input**: Full-width text input
- **Sheet**: Expanded interface for sheets

Screens configure the bar via `useBar()` hook and `useFocusEffect`.

---

## Quick Start

```typescript
import { Bar, useBar } from '@ariob/ripple';
import { useFocusEffect } from 'expo-router';

// In _layout.tsx - render Bar once
function RootLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <Bar />
    </>
  );
}

// In screens - configure bar on focus
function FeedScreen() {
  const bar = useBar();

  useFocusEffect(
    useCallback(() => {
      bar.setActions({
        primary: { icon: 'add', onPress: handleCompose },
        trailing: [{ icon: 'search', onPress: handleSearch }],
      });
    }, [bar.setActions])
  );

  return <FeedList />;
}
```

---

## useBar Hook

Control the bar programmatically.

### Import

```typescript
import { useBar } from '@ariob/ripple';
```

### API

```typescript
const bar = useBar();

interface BarActions {
  // Stack operations
  push: (frame: BarFrame) => void;
  pop: () => void;
  replace: (frame: BarFrame) => void;
  reset: () => void;

  // Quick helpers
  setActions: (actions: FrameActions) => void;
  openInput: (config?: InputConfig) => void;
  openSheet: (content: ReactNode, options?: SheetOptions) => void;

  // Input state
  setInputValue: (value: string) => void;
  clearInputValue: () => void;
}
```

### Actions Configuration

```typescript
interface FrameActions {
  leading?: ActionSlot[];   // Left side buttons
  primary?: ActionSlot;     // Center primary action
  trailing?: ActionSlot[];  // Right side buttons
}

interface ActionSlot {
  icon: string;            // Ionicons name
  onPress: () => void;     // Press handler
  label?: string;          // Optional text label
}
```

---

## Usage Patterns

### Screen-Specific Actions

Use `useFocusEffect` to set bar actions when a screen gains focus:

```typescript
function ProfileScreen() {
  const bar = useBar();

  const handleBack = useCallback(() => router.back(), []);
  const handleEdit = useCallback(() => console.log('Edit'), []);

  useFocusEffect(
    useCallback(() => {
      bar.setActions({
        leading: [{ icon: 'arrow-back', onPress: handleBack }],
        primary: { icon: 'pencil', onPress: handleEdit },
      });
    }, [bar.setActions, handleBack, handleEdit])
  );

  return <ProfileContent />;
}
```

### Opening Sheets

```typescript
function FeedScreen() {
  const bar = useBar();

  const openCompose = useCallback(() => {
    bar.openSheet(
      <ComposeSheet onClose={() => bar.pop()} />
    );
  }, [bar]);

  useFocusEffect(
    useCallback(() => {
      bar.setActions({
        primary: { icon: 'add', onPress: openCompose },
      });
    }, [bar.setActions, openCompose])
  );
}
```

### Opening Input Mode

```typescript
function SearchScreen() {
  const bar = useBar();

  useFocusEffect(
    useCallback(() => {
      bar.openInput({
        placeholder: 'Search...',
        autoFocus: true,
        onSubmit: (text) => {
          search(text);
          bar.pop();
        },
      });
    }, [bar.openInput])
  );
}
```

---

## Stack Operations

The bar uses a stack for navigation history:

| Method | Description |
|--------|-------------|
| `push(frame)` | Add frame to stack |
| `pop()` | Remove current frame, go back |
| `replace(frame)` | Replace current frame |
| `reset()` | Clear to base frame only |

```typescript
// Push a new frame
bar.push({
  id: 'custom-frame',
  mode: 'action',
  actions: { primary: { icon: 'close', onPress: bar.pop } },
  canDismiss: true,
});

// Go back
bar.pop();

// Reset to initial state
bar.reset();
```

---

## Frame Types

### Action Frame

Default mode with action buttons.

```typescript
{
  id: 'feed-actions',
  mode: 'action',
  actions: {
    leading: [{ icon: 'menu', onPress: openMenu }],
    primary: { icon: 'add', onPress: openCompose },
    trailing: [{ icon: 'search', onPress: openSearch }],
  },
}
```

### Input Frame

Text input mode for search, compose, etc.

```typescript
{
  id: 'search-input',
  mode: 'input',
  input: {
    placeholder: 'Search...',
    autoFocus: true,
    showSendButton: true,
    onSubmit: (text) => handleSearch(text),
  },
  canDismiss: true,
}
```

### Sheet Frame

Expanded sheet for complex UIs.

```typescript
{
  id: 'compose-sheet',
  mode: 'sheet',
  sheet: {
    content: <ComposeSheet />,
    height: 'auto',
  },
  canDismiss: true,
}
```

---

## Bar Component

Render once in your root layout.

### Import

```typescript
import { Bar } from '@ariob/ripple';
```

### Usage

```typescript
// app/_layout.tsx
import { Bar } from '@ariob/ripple';

export default function RootLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="profile/[id]" />
      </Stack>
      <Bar />
    </View>
  );
}
```

---

## Creating Sheets

Sheets are React components that receive close handler via `bar.pop()`.

```typescript
interface ComposeSheetProps {
  onClose: () => void;
}

function ComposeSheet({ onClose }: ComposeSheetProps) {
  const [content, setContent] = useState('');

  const handleSubmit = async () => {
    await createPost(content);
    onClose();
  };

  return (
    <Stack gap="md" style={styles.container}>
      <Text size="title">New Post</Text>
      <TextInput
        value={content}
        onChangeText={setContent}
        placeholder="What's on your mind?"
        multiline
      />
      <Row gap="sm">
        <Button onPress={onClose} variant="ghost">Cancel</Button>
        <Button onPress={handleSubmit}>Post</Button>
      </Row>
    </Stack>
  );
}
```

---

## Best Practices

### 1. Use useFocusEffect, Not useEffect

```typescript
// Good: Resets bar when navigating back
useFocusEffect(
  useCallback(() => {
    bar.setActions({ ... });
  }, [bar.setActions])
);

// Bad: Only runs on mount
useEffect(() => {
  bar.setActions({ ... });
}, []);
```

### 2. Stable Dependencies

```typescript
// Good: Use bar.setActions in dependencies (stable reference)
useFocusEffect(
  useCallback(() => {
    bar.setActions({ primary: { icon: 'add', onPress: handleAdd } });
  }, [bar.setActions, handleAdd])
);

// Bad: Using bar object causes infinite loop
useFocusEffect(
  useCallback(() => {
    bar.setActions({ ... });
  }, [bar])  // Don't do this!
);
```

### 3. Keep Refs for Callbacks

```typescript
// For callbacks that change frequently
const openSheetRef = useRef(openSheet);
openSheetRef.current = openSheet;

useFocusEffect(
  useCallback(() => {
    bar.setActions({
      primary: { icon: 'add', onPress: () => openSheetRef.current() },
    });
  }, [bar.setActions])
);
```

---

## Related Documentation

- [Hooks](./HOOKS.md) - useBar and other hooks
- [Architecture](./ARCHITECTURE.md) - Design patterns
- [Primitives](./PRIMITIVES.md) - Shell, Avatar, etc.
