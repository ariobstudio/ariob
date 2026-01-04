# Primitives

> Base building blocks for Ripple UI components

---

## Overview

Primitives are the foundational components that compose into larger UI elements:

| Primitive | Purpose |
|-----------|---------|
| **Shell** | Container with long-press gesture, context menu support |
| **Avatar** | User/entity avatar display |
| **Badge** | Status indicators and labels |
| **Dot** | Timeline status dot |
| **Line** | Timeline connector line |

---

## Shell

The foundation container for all interactive Ripple content. Provides long-press gesture handling for context menus.

### Import

```typescript
import { Shell } from '@ariob/ripple';
```

### Props

```typescript
interface ShellProps {
  children: ReactNode;
  nodeRef?: NodeRef;           // Required for context menu
  onPress?: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  variant?: 'default' | 'ghost' | 'glow';
  style?: ViewStyle;
  disabled?: boolean;
}

interface NodeRef {
  id: string;
  type: string;
  author?: string;
}
```

### Usage

```tsx
import { Shell } from '@ariob/ripple';

// Basic usage
<Shell onPress={() => navigate('/post/123')}>
  <PostContent />
</Shell>

// With context menu support
<Shell
  nodeRef={{ id: 'post-123', type: 'post', author: 'alice' }}
  onPress={() => navigate('/post/123')}
>
  <PostContent />
</Shell>

// Variant: ghost (loading state)
<Shell variant="ghost">
  <SkeletonContent />
</Shell>

// Variant: glow (featured)
<Shell variant="glow" nodeRef={...}>
  <FeaturedContent />
</Shell>
```

### Variants

| Variant | Appearance | Use Case |
|---------|------------|----------|
| `default` | Semi-transparent dark surface with shadow | Standard content |
| `ghost` | Transparent with dashed border | Loading/placeholder states |
| `glow` | Cyan bioluminescent glow effect | Featured/highlighted content |

### Context Menu Integration

When `nodeRef` is provided, long-pressing (400ms) opens the context menu:

```tsx
<Shell
  nodeRef={{ id: 'post-123', type: 'post' }}
  onPress={handlePress}
>
  <Content />
</Shell>

// Long press → Context menu appears with actions for this post
```

---

## Avatar

User or entity avatar with fallback support.

### Import

```typescript
import { Avatar } from '@ariob/ripple';
```

### Props

```typescript
interface AvatarProps {
  source?: string | ImageSource;
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  fallback?: string;           // Initials or icon name
  onPress?: () => void;
  style?: ViewStyle;
}
```

### Usage

```tsx
import { Avatar } from '@ariob/ripple';

// With image
<Avatar
  source="https://example.com/avatar.jpg"
  size="md"
  onPress={() => navigate('/profile')}
/>

// With fallback initials
<Avatar
  source={null}
  fallback="AS"
  size="lg"
/>

// Custom size
<Avatar
  source={avatarUrl}
  size={48}
/>
```

### Sizes

| Size | Pixels |
|------|--------|
| `sm` | 24 |
| `md` | 32 |
| `lg` | 48 |
| `xl` | 64 |

---

## Badge

Status indicators and labels.

### Import

```typescript
import { Badge } from '@ariob/ripple';
```

### Props

```typescript
interface BadgeProps {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'dm' | 'ai';
  size?: 'sm' | 'md';
  icon?: string;
  style?: ViewStyle;
}
```

### Usage

```tsx
import { Badge } from '@ariob/ripple';

// Default badge
<Badge label="New" />

// Status variants
<Badge label="Online" variant="success" />
<Badge label="Away" variant="warning" />
<Badge label="Offline" variant="danger" />

// Special variants
<Badge label="DM" variant="dm" />
<Badge label="AI" variant="ai" />

// With icon
<Badge
  label="Verified"
  variant="info"
  icon="checkmark-circle"
/>
```

### Variants

| Variant | Color | Use Case |
|---------|-------|----------|
| `default` | Gray | General labels |
| `success` | Green | Positive status |
| `warning` | Orange | Caution status |
| `danger` | Red | Error/urgent status |
| `info` | Blue | Information |
| `dm` | Blue | Direct message indicator |
| `ai` | Orange | AI-generated content |

---

## Dot

Timeline status indicator.

### Import

```typescript
import { Dot } from '@ariob/ripple';
```

### Props

```typescript
interface DotProps {
  color?: string;
  size?: 'sm' | 'md' | 'lg' | number;
  animated?: boolean;
  style?: ViewStyle;
}
```

### Usage

```tsx
import { Dot } from '@ariob/ripple';

// Default dot
<Dot />

// Colored by degree
<Dot color={theme.colors.degree[1]} />

// Animated (pulsing)
<Dot animated />

// Custom size
<Dot size={12} />
```

### Sizes

| Size | Pixels |
|------|--------|
| `sm` | 6 |
| `md` | 8 |
| `lg` | 10 |

### In Timeline

```tsx
<View style={styles.timeline}>
  <Line />
  <Dot color={degreeColor} />
  <Line />
</View>
```

---

## Line

Timeline connector line.

### Import

```typescript
import { Line } from '@ariob/ripple';
```

### Props

```typescript
interface LineProps {
  height?: number | 'flex';
  color?: string;
  style?: ViewStyle;
}
```

### Usage

```tsx
import { Line } from '@ariob/ripple';

// Fixed height
<Line height={20} />

// Flexible height (fills container)
<Line height="flex" />

// Custom color
<Line color={theme.colors.borderSubtle} />
```

### In Timeline

```tsx
<View style={styles.timelineContainer}>
  {/* Top connector */}
  <Line height={16} />

  {/* Status dot */}
  <Dot color={degreeColor} />

  {/* Bottom connector (hidden for last item) */}
  {!isLast && <Line height="flex" />}
</View>
```

---

## Re-exported from Andromeda

These primitives from @ariob/andromeda are re-exported for convenience:

### Layout

```typescript
import { Box, Row, Stack, Grid, Scroll } from '@ariob/ripple';
```

| Component | Purpose |
|-----------|---------|
| `Box` | Basic container with theme-aware styling |
| `Row` | Horizontal flex container |
| `Stack` | Vertical flex container |
| `Grid` | Grid layout container |
| `Scroll` | Scrollable container |

### Typography & Interaction

```typescript
import { Text, Icon, Press, Button, Input, Label, Divider } from '@ariob/ripple';
```

| Component | Purpose |
|-----------|---------|
| `Text` | Themed text component |
| `Icon` | Ionicons icon component |
| `Press` | Pressable with feedback |
| `Button` | Styled button |
| `Input` | Text input |
| `Label` | Form label |
| `Divider` | Horizontal divider |

---

## Composition Example

Building a node using primitives:

```tsx
import { Shell, Avatar, Badge, Dot, Line, Box, Row, Text } from '@ariob/ripple';

function PostNode({ data, isLast, onPress, onAvatarPress }) {
  return (
    <Row style={styles.container}>
      {/* Timeline */}
      <Box style={styles.timeline}>
        <Line height={16} />
        <Dot color={getDegreeColor(data.degree)} />
        {!isLast && <Line height="flex" />}
      </Box>

      {/* Content */}
      <Shell
        nodeRef={{ id: data.id, type: 'post', author: data.author }}
        onPress={onPress}
        style={styles.content}
      >
        {/* Header */}
        <Row style={styles.header}>
          <Avatar
            source={data.avatar}
            size="md"
            onPress={onAvatarPress}
          />
          <Box style={styles.meta}>
            <Text variant="body">{data.author}</Text>
            <Text variant="caption">{data.timestamp}</Text>
          </Box>
          {data.isAI && <Badge label="AI" variant="ai" />}
        </Row>

        {/* Body */}
        <Text style={styles.body}>{data.content}</Text>
      </Shell>
    </Row>
  );
}
```

---

## Styling

Primitives use react-native-unistyles for theming:

```typescript
import { createStyleSheet, useStyles } from 'react-native-unistyles';

const stylesheet = createStyleSheet((theme) => ({
  shell: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
  },
  dot: {
    backgroundColor: theme.colors.degree[1],
  },
  line: {
    backgroundColor: theme.colors.borderSubtle,
    width: 2,
  },
}));

function MyComponent() {
  const { styles, theme } = useStyles(stylesheet);

  return (
    <Shell style={styles.shell}>
      <Dot style={styles.dot} />
    </Shell>
  );
}
```

---

## Related Documentation

- [Architecture](./ARCHITECTURE.md) - Component hierarchy
- [Nodes](./NODES.md) - Content type modules
- [Styles](./STYLES.md) - Theme tokens
