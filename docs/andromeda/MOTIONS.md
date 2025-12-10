# Motions

Animation components and hooks.

---

## Overview

Motion components wrap Reanimated for common animation patterns. They handle enter/exit animations and interactive feedback.

| Component | Purpose |
|-----------|---------|
| [Fade](#fade) | Opacity animations |
| [Slide](#slide) | Translation animations |
| [Spring](#spring) | Spring-based animations |
| [usePressScale](#usepressscale) | Press feedback hook |

---

## Fade

Opacity-based enter/exit animations.

### Import

```typescript
import { Fade, FadeEnter, FadeExit } from '@ariob/andromeda';
```

### Fade Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | **required** | Content to animate |
| `visible` | `boolean` | `true` | Control visibility |
| `duration` | `number` | `250` | Animation duration (ms) |
| `delay` | `number` | `0` | Animation delay (ms) |
| `style` | `ViewStyle` | - | Additional styles |

### FadeEnter / FadeExit Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | **required** | Content to animate |
| `duration` | `number` | `250` | Animation duration (ms) |
| `delay` | `number` | `0` | Animation delay (ms) |

### Examples

```typescript
// Controlled fade
<Fade visible={isVisible}>
  <Card>Content</Card>
</Fade>

// With custom timing
<Fade visible={isVisible} duration={400} delay={100}>
  <Text>Delayed fade</Text>
</Fade>

// Enter-only animation (mount animation)
<FadeEnter duration={300}>
  <Text>Fades in on mount</Text>
</FadeEnter>

// Exit-only animation (unmount animation)
{isVisible && (
  <FadeExit duration={200}>
    <Card>Fades out before unmount</Card>
  </FadeExit>
)}

// Staggered list
<Stack gap="md">
  {items.map((item, index) => (
    <FadeEnter key={item.id} delay={index * 50}>
      <Card>{item.content}</Card>
    </FadeEnter>
  ))}
</Stack>

// Modal content
<Modal visible={isOpen} onClose={close}>
  <Fade visible={isOpen} duration={200}>
    <Card>
      <Text size="heading">Modal Title</Text>
      <Text>Modal content</Text>
    </Card>
  </Fade>
</Modal>
```

---

## Slide

Translation-based animations.

### Import

```typescript
import { Slide, SlideUp, SlideDown } from '@ariob/andromeda';
```

### Slide Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | **required** | Content to animate |
| `visible` | `boolean` | `true` | Control visibility |
| `direction` | `SlideDirection` | `'up'` | Slide direction |
| `distance` | `number` | `20` | Slide distance (px) |
| `duration` | `number` | `250` | Animation duration (ms) |
| `delay` | `number` | `0` | Animation delay (ms) |
| `style` | `ViewStyle` | - | Additional styles |

### SlideUp / SlideDown Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | **required** | Content to animate |
| `distance` | `number` | `20` | Slide distance |
| `duration` | `number` | `250` | Animation duration |
| `delay` | `number` | `0` | Animation delay |

### Types

```typescript
type SlideDirection = 'up' | 'down' | 'left' | 'right';
```

### Examples

```typescript
// Controlled slide
<Slide visible={isVisible} direction="up">
  <Card>Slides up when visible</Card>
</Slide>

// Different directions
<Slide visible={v} direction="up">...</Slide>
<Slide visible={v} direction="down">...</Slide>
<Slide visible={v} direction="left">...</Slide>
<Slide visible={v} direction="right">...</Slide>

// Custom distance
<Slide visible={isVisible} distance={50}>
  <Card>Slides 50px</Card>
</Slide>

// Shorthand components
<SlideUp delay={100}>
  <Text>Slides up on mount</Text>
</SlideUp>

<SlideDown>
  <Text>Slides down on mount</Text>
</SlideDown>

// Bottom sheet content
<BottomSheet visible={isOpen}>
  <SlideUp duration={300}>
    <Stack gap="md" style={{ padding: 20 }}>
      <Text size="heading">Sheet Title</Text>
      <Text>Sheet content</Text>
      <Button onPress={close}>Close</Button>
    </Stack>
  </SlideUp>
</BottomSheet>

// Notification slide-in
{notification && (
  <Slide visible={!!notification} direction="down" distance={100}>
    <Card variant="elevated" style={{ margin: 16 }}>
      <Row align="center" gap="md">
        <Icon name="notifications" color="accent" />
        <Text style={{ flex: 1 }}>{notification.message}</Text>
        <IconButton icon="close" size="sm" onPress={dismiss} />
      </Row>
    </Card>
  </Slide>
)}
```

---

## Spring

Spring-based animations using Reanimated.

### Import

```typescript
import { Spring, useSpring } from '@ariob/andromeda';
```

### Spring Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | **required** | Content to animate |
| `from` | `object` | - | Initial animated values |
| `to` | `object` | - | Target animated values |
| `config` | `SpringConfig` | `'smooth'` | Spring configuration |
| `style` | `ViewStyle` | - | Additional styles |

### useSpring Hook

```typescript
const style = useSpring({
  from: { opacity: 0, scale: 0.9 },
  to: { opacity: 1, scale: 1 },
  config: 'snappy',
});
```

### Spring Configs

| Config | Damping | Stiffness | Mass | Character |
|--------|---------|-----------|------|-----------|
| `snappy` | 25 | 300 | 0.6 | Quick, responsive |
| `smooth` | 20 | 200 | 0.8 | Standard, balanced |
| `bouncy` | 12 | 150 | 1.0 | Playful, elastic |
| `gentle` | 16 | 120 | 1.0 | Slow, deliberate |

### Examples

```typescript
// Component approach
<Spring
  from={{ opacity: 0, translateY: 20 }}
  to={{ opacity: 1, translateY: 0 }}
  config="snappy"
>
  <Card>Spring animated</Card>
</Spring>

// Hook approach
function AnimatedCard() {
  const animatedStyle = useSpring({
    from: { scale: 0.9, opacity: 0 },
    to: { scale: 1, opacity: 1 },
    config: 'bouncy',
  });

  return (
    <Animated.View style={animatedStyle}>
      <Card>Animated content</Card>
    </Animated.View>
  );
}

// Interactive animation
function InteractiveCard({ isSelected }) {
  const style = useSpring({
    to: {
      scale: isSelected ? 1.05 : 1,
      borderColor: isSelected ? theme.colors.accent : theme.colors.border,
    },
    config: 'snappy',
  });

  return (
    <Animated.View style={style}>
      <Card>Selectable card</Card>
    </Animated.View>
  );
}

// Page transition
function PageContent({ children }) {
  return (
    <Spring
      from={{ opacity: 0, translateX: 20 }}
      to={{ opacity: 1, translateX: 0 }}
      config="smooth"
    >
      {children}
    </Spring>
  );
}
```

---

## usePressScale

Hook for press feedback animations.

### Import

```typescript
import { usePressScale } from '@ariob/andromeda';
```

### API

```typescript
const { style, onPressIn, onPressOut } = usePressScale({
  scale?: number;     // Scale factor (default: 0.97)
  config?: string;    // Spring config (default: 'snappy')
});
```

### Examples

```typescript
// Basic usage
function PressableCard({ children, onPress }) {
  const { style, onPressIn, onPressOut } = usePressScale();

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
    >
      <Animated.View style={style}>
        <Card>{children}</Card>
      </Animated.View>
    </Pressable>
  );
}

// Custom scale
const { style, ...handlers } = usePressScale({ scale: 0.95 });

// With haptics
function HapticCard({ children, onPress }) {
  const { style, onPressIn, onPressOut } = usePressScale();

  const handlePressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPressIn();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={onPressOut}
    >
      <Animated.View style={style}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

// Button with scale feedback
function AnimatedButton({ children, onPress }) {
  const { style, onPressIn, onPressOut } = usePressScale({
    scale: 0.96,
    config: 'snappy',
  });

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
    >
      <Animated.View style={[buttonStyles, style]}>
        <Text>{children}</Text>
      </Animated.View>
    </Pressable>
  );
}
```

---

## Composition Patterns

### Animated List Item

```typescript
function AnimatedListItem({ item, index, onPress }) {
  const { style, onPressIn, onPressOut } = usePressScale();

  return (
    <FadeEnter delay={index * 30}>
      <SlideUp delay={index * 30} distance={10}>
        <Pressable
          onPress={onPress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
        >
          <Animated.View style={style}>
            <Card>
              <Row align="center" gap="md">
                <Avatar char={item.name[0]} />
                <Text>{item.name}</Text>
              </Row>
            </Card>
          </Animated.View>
        </Pressable>
      </SlideUp>
    </FadeEnter>
  );
}
```

### Modal with Animations

```typescript
function AnimatedModal({ visible, onClose, children }) {
  return (
    <Modal visible={visible} transparent>
      <Fade visible={visible} duration={200}>
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
        />
      </Fade>

      <Slide visible={visible} direction="up" distance={50}>
        <Card style={styles.content}>
          {children}
        </Card>
      </Slide>
    </Modal>
  );
}
```

### Skeleton Loading

```typescript
function Skeleton({ width, height }) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.7, { duration: 800 }),
      -1,
      true
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    backgroundColor: theme.colors.muted,
    borderRadius: 4,
    width,
    height,
  }));

  return <Animated.View style={style} />;
}
```
