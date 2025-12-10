# Gestures

Touch interaction handlers for rich mobile interactions.

---

## Overview

Ripple provides gesture handlers that integrate with the menu system:

| Gesture | Component/Hook | Purpose |
|---------|----------------|---------|
| [Shell](#shell) | `<Shell>` | Long-press context wrapper |
| [Hold](#usehold) | `useHold()` | Long-press handler |
| [Swipe](#useswipe) | `useSwipe()` | Swipe actions |
| [DoubleTap](#usedoubletap) | `useDoubleTap()` | Double-tap actions |

---

## Shell

Wrapper component that enables long-press context menus.

### Import

```typescript
import { Shell } from '@ariob/ripple';
```

### Props

| Prop | Type | Description |
|------|------|-------------|
| `children` | `ReactNode` | Content to wrap |
| `nodeRef` | `NodeRef` | Reference to the node |
| `disabled` | `boolean` | Disable context menu |
| `style` | `ViewStyle` | Additional styles |

### NodeRef Type

```typescript
interface NodeRef {
  id: string;
  type: string;  // 'post' | 'message' | 'profile' | etc.
}
```

### Example

```typescript
// Basic usage
<Shell nodeRef={{ id: post.id, type: 'post' }}>
  <Post data={post} />
</Shell>

// Disabled context menu
<Shell nodeRef={{ id: item.id, type: item.type }} disabled>
  <LockedContent />
</Shell>

// With custom styles
<Shell
  nodeRef={{ id: message.id, type: 'message' }}
  style={{ marginVertical: 4 }}
>
  <Message data={message} />
</Shell>

// In a list
<FlatList
  data={posts}
  renderItem={({ item }) => (
    <Shell nodeRef={{ id: item.id, type: 'post' }}>
      <Post data={item} onPress={() => openThread(item.id)} />
    </Shell>
  )}
/>
```

### How It Works

1. User long-presses on wrapped content
2. Shell captures the press and nodeRef
3. Context menu opens with actions from `nodeMenus` config
4. User taps an action
5. `onAction` callback fires with action name and context

---

## useHold

Hook for custom long-press handling.

### Import

```typescript
import { useHold } from '@ariob/ripple';
```

### API

```typescript
const { handlers, isHolding } = useHold({
  onHold: () => void;
  duration?: number;  // Default: 500ms
  disabled?: boolean;
});
```

### Returns

| Property | Type | Description |
|----------|------|-------------|
| `handlers` | `GestureHandlers` | Spread onto component |
| `isHolding` | `boolean` | Currently being held |

### Example

```typescript
function HoldableCard({ onHold, children }) {
  const { handlers, isHolding } = useHold({
    onHold,
    duration: 400,
  });

  return (
    <Animated.View
      {...handlers}
      style={{
        transform: [{ scale: isHolding ? 0.98 : 1 }],
      }}
    >
      {children}
    </Animated.View>
  );
}

// Usage
<HoldableCard onHold={() => openMenu(item)}>
  <Text>Hold me</Text>
</HoldableCard>
```

### With Haptic Feedback

```typescript
function HapticHoldable({ onHold, children }) {
  const { handlers, isHolding } = useHold({
    onHold: () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onHold();
    },
  });

  return (
    <Pressable {...handlers}>
      {children}
    </Pressable>
  );
}
```

---

## useSwipe

Hook for swipe gesture actions.

### Import

```typescript
import { useSwipe } from '@ariob/ripple';
```

### API

```typescript
const gesture = useSwipe(nodeRef, {
  left?: () => void;    // Swipe left action
  right?: () => void;   // Swipe right action
  threshold?: number;   // Activation threshold (default: 80)
  disabled?: boolean;
});
```

### Returns

A Reanimated gesture handler to use with `GestureDetector`.

### Example

```typescript
import { GestureDetector } from 'react-native-gesture-handler';
import { useSwipe } from '@ariob/ripple';

function SwipeableMessage({ message, onDelete, onReply }) {
  const gesture = useSwipe(
    { id: message.id, type: 'message' },
    {
      left: onDelete,
      right: onReply,
      threshold: 100,
    }
  );

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={animatedStyle}>
        <Message data={message} />
      </Animated.View>
    </GestureDetector>
  );
}
```

### With Visual Feedback

```typescript
function SwipeableCard({ item, onArchive, onDelete }) {
  const translateX = useSharedValue(0);

  const gesture = useSwipe(
    { id: item.id, type: item.type },
    {
      left: () => {
        runOnJS(onDelete)();
      },
      right: () => {
        runOnJS(onArchive)();
      },
    }
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const leftIndicator = useAnimatedStyle(() => ({
    opacity: translateX.value > 40 ? 1 : 0,
  }));

  const rightIndicator = useAnimatedStyle(() => ({
    opacity: translateX.value < -40 ? 1 : 0,
  }));

  return (
    <View>
      {/* Background indicators */}
      <Animated.View style={[styles.indicator, styles.left, leftIndicator]}>
        <Icon name="archive" color="success" />
      </Animated.View>
      <Animated.View style={[styles.indicator, styles.right, rightIndicator]}>
        <Icon name="trash" color="danger" />
      </Animated.View>

      {/* Swipeable content */}
      <GestureDetector gesture={gesture}>
        <Animated.View style={animatedStyle}>
          <Card>{item.content}</Card>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
```

---

## useDoubleTap

Hook for double-tap actions.

### Import

```typescript
import { useDoubleTap } from '@ariob/ripple';
```

### API

```typescript
const handlers = useDoubleTap({
  onDoubleTap: () => void;
  onSingleTap?: () => void;
  delay?: number;  // Double-tap window (default: 300ms)
});
```

### Returns

Gesture handlers to spread onto a Pressable.

### Example

```typescript
function LikeablePost({ post, onLike, onPress }) {
  const handlers = useDoubleTap({
    onDoubleTap: () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onLike(post.id);
    },
    onSingleTap: onPress,
  });

  return (
    <Pressable {...handlers}>
      <Post data={post} />
    </Pressable>
  );
}
```

### With Heart Animation

```typescript
function DoubleTapLike({ post, onLike }) {
  const [showHeart, setShowHeart] = useState(false);
  const scale = useSharedValue(0);

  const handlers = useDoubleTap({
    onDoubleTap: () => {
      setShowHeart(true);
      scale.value = withSequence(
        withSpring(1.2, { damping: 5 }),
        withSpring(0, { damping: 10 })
      );

      setTimeout(() => setShowHeart(false), 800);
      onLike(post.id);
    },
  });

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: scale.value,
  }));

  return (
    <Pressable {...handlers}>
      <Post data={post} />

      {showHeart && (
        <Animated.View style={[styles.heartOverlay, heartStyle]}>
          <Icon name="heart" size="lg" color="danger" />
        </Animated.View>
      )}
    </Pressable>
  );
}
```

---

## Combining Gestures

### Shell + Swipe

```typescript
function SwipeableShell({ item, children }) {
  const gesture = useSwipe(
    { id: item.id, type: item.type },
    {
      left: () => deleteItem(item.id),
      right: () => archiveItem(item.id),
    }
  );

  return (
    <Shell nodeRef={{ id: item.id, type: item.type }}>
      <GestureDetector gesture={gesture}>
        <Animated.View>
          {children}
        </Animated.View>
      </GestureDetector>
    </Shell>
  );
}
```

### DoubleTap + Shell

```typescript
function LikeableShell({ item, children, onLike }) {
  const tapHandlers = useDoubleTap({
    onDoubleTap: () => onLike(item.id),
    onSingleTap: () => openDetail(item.id),
  });

  return (
    <Shell nodeRef={{ id: item.id, type: item.type }}>
      <Pressable {...tapHandlers}>
        {children}
      </Pressable>
    </Shell>
  );
}
```

---

## Best Practices

### Provide Visual Feedback

Always show users that their gesture is being recognized:

```typescript
// Scale on hold
const scale = isHolding ? 0.98 : 1;

// Color change on swipe
const backgroundColor = translateX > threshold
  ? 'rgba(0, 186, 124, 0.2)'
  : 'transparent';

// Heart animation on double-tap
showHeart && <HeartAnimation />
```

### Use Appropriate Thresholds

| Gesture | Recommended Threshold |
|---------|----------------------|
| Long-press | 400-600ms |
| Swipe | 80-120px |
| Double-tap | 250-350ms |

### Disable During Transitions

```typescript
<Shell
  nodeRef={nodeRef}
  disabled={isAnimating || isDeleting}
>
  ...
</Shell>
```

### Add Haptic Feedback

```typescript
import * as Haptics from 'expo-haptics';

// Light for taps
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

// Medium for significant actions
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

// Heavy for destructive actions
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

// Selection feedback for toggles
Haptics.selectionAsync();
```
