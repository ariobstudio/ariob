# Atoms

Indivisible building blocks of the design system.

---

## Overview

Atoms are the smallest components - they cannot be broken down further. Each atom serves a single purpose and can be composed into molecules and organisms.

| Component | Purpose |
|-----------|---------|
| [Text](#text) | Typography |
| [Button](#button) | Primary actions |
| [Input](#input) | Text entry |
| [Icon](#icon) | Visual symbols |
| [Badge](#badge) | Status indicators |
| [Dot](#dot) | Timeline markers |
| [Line](#line) | Timeline connectors |
| [Divider](#divider) | Section separators |
| [Label](#label) | Form labels |
| [Press](#press) | Pressable wrapper with haptics |

---

## Text

Typography component with semantic sizing and colors.

### Import

```typescript
import { Text } from '@ariob/andromeda';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | **required** | Text content |
| `size` | `TextSize` | `'body'` | Typography scale |
| `color` | `TextColor` | `'text'` | Semantic color |
| `style` | `TextStyle` | - | Additional styles |
| `...rest` | `RNTextProps` | - | All React Native Text props |

### Types

```typescript
type TextSize = 'title' | 'heading' | 'body' | 'caption' | 'mono';
type TextColor = 'text' | 'dim' | 'faint' | 'accent' | 'success' | 'warn' | 'danger';
```

### Size Reference

| Size | Font Size | Weight | Letter Spacing |
|------|-----------|--------|----------------|
| `title` | 24 | 700 | -0.5 |
| `heading` | 18 | 600 | - |
| `body` | 15 | 500 | - |
| `caption` | 12 | 500 | - |
| `mono` | 11 | 600 | 0.4 |

### Examples

```typescript
// Basic usage
<Text>Hello World</Text>

// Different sizes
<Text size="title">Page Title</Text>
<Text size="heading">Section Heading</Text>
<Text size="body">Body text</Text>
<Text size="caption">Small caption</Text>
<Text size="mono">monospace code</Text>

// Different colors
<Text color="text">Primary text</Text>
<Text color="dim">Secondary text</Text>
<Text color="faint">Muted text</Text>
<Text color="accent">Accent text</Text>
<Text color="success">Success message</Text>
<Text color="warn">Warning message</Text>
<Text color="danger">Error message</Text>

// Combined
<Text size="caption" color="dim">
  Last updated 5 minutes ago
</Text>
```

---

## Button

Primary interactive component for actions.

### Import

```typescript
import { Button } from '@ariob/andromeda';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | **required** | Button label |
| `onPress` | `() => void` | **required** | Press handler |
| `variant` | `ButtonVariant` | `'solid'` | Visual style |
| `tint` | `ButtonTint` | `'accent'` | Color tint |
| `size` | `ButtonSize` | `'md'` | Size preset |
| `icon` | `string` | - | Ionicons icon name |
| `iconPosition` | `'left' \| 'right'` | `'left'` | Icon position |
| `loading` | `boolean` | `false` | Show loading spinner |
| `disabled` | `boolean` | `false` | Disable interaction |
| `style` | `ViewStyle` | - | Additional styles |

### Types

```typescript
type ButtonVariant = 'solid' | 'outline' | 'ghost';
type ButtonTint = 'default' | 'accent' | 'success' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';
```

### Size Reference

| Size | Height | Horizontal Padding | Font Size | Icon Size |
|------|--------|-------------------|-----------|-----------|
| `sm` | 32 | 12 | 13 | 14 |
| `md` | 40 | 16 | 15 | 16 |
| `lg` | 48 | 20 | 17 | 20 |

### Examples

```typescript
// Basic usage
<Button onPress={handleSubmit}>Submit</Button>

// Variants
<Button variant="solid" onPress={action}>Solid</Button>
<Button variant="outline" onPress={action}>Outline</Button>
<Button variant="ghost" onPress={action}>Ghost</Button>

// Tints
<Button tint="accent" onPress={action}>Primary</Button>
<Button tint="success" onPress={action}>Confirm</Button>
<Button tint="danger" onPress={action}>Delete</Button>

// Sizes
<Button size="sm" onPress={action}>Small</Button>
<Button size="md" onPress={action}>Medium</Button>
<Button size="lg" onPress={action}>Large</Button>

// With icon
<Button icon="add" onPress={action}>Create</Button>
<Button icon="send" iconPosition="right" onPress={action}>Send</Button>

// States
<Button loading onPress={action}>Processing</Button>
<Button disabled onPress={action}>Disabled</Button>

// Combined
<Button
  variant="outline"
  tint="danger"
  size="sm"
  icon="trash"
  onPress={handleDelete}
>
  Delete
</Button>
```

---

## Input

Text input component for forms.

### Import

```typescript
import { Input } from '@ariob/andromeda';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | **required** | Current value |
| `onChangeText` | `(text: string) => void` | **required** | Change handler |
| `placeholder` | `string` | - | Placeholder text |
| `variant` | `InputVariant` | `'outline'` | Visual style |
| `size` | `InputSize` | `'md'` | Size preset |
| `disabled` | `boolean` | `false` | Disable interaction |
| `error` | `boolean` | `false` | Show error state |
| `multiline` | `boolean` | `false` | Enable multiline |
| `autoFocus` | `boolean` | `false` | Auto focus on mount |
| `style` | `ViewStyle` | - | Additional styles |
| `...rest` | `RNTextInputProps` | - | All React Native TextInput props |

### Types

```typescript
type InputVariant = 'outline' | 'filled' | 'ghost';
type InputSize = 'sm' | 'md' | 'lg';
```

### Size Reference

| Size | Height | Horizontal Padding | Font Size |
|------|--------|-------------------|-----------|
| `sm` | 36 | 8 | 12 |
| `md` | 44 | 12 | 15 |
| `lg` | 52 | 16 | 18 |

### Examples

```typescript
// Basic usage
<Input
  value={text}
  onChangeText={setText}
  placeholder="Enter text..."
/>

// Variants
<Input variant="outline" value={v} onChangeText={setV} />
<Input variant="filled" value={v} onChangeText={setV} />
<Input variant="ghost" value={v} onChangeText={setV} />

// Sizes
<Input size="sm" value={v} onChangeText={setV} />
<Input size="md" value={v} onChangeText={setV} />
<Input size="lg" value={v} onChangeText={setV} />

// States
<Input value={v} onChangeText={setV} error />
<Input value={v} onChangeText={setV} disabled />

// Multiline
<Input
  value={bio}
  onChangeText={setBio}
  multiline
  numberOfLines={4}
  placeholder="Tell us about yourself..."
/>

// With keyboard type
<Input
  value={email}
  onChangeText={setEmail}
  keyboardType="email-address"
  autoCapitalize="none"
  placeholder="email@example.com"
/>
```

---

## Icon

Ionicons wrapper with consistent sizing.

### Import

```typescript
import { Icon } from '@ariob/andromeda';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | **required** | Ionicons icon name |
| `size` | `IconSize` | `'md'` | Size preset |
| `color` | `IconColor` | `'text'` | Semantic color |

### Types

```typescript
type IconSize = 'sm' | 'md' | 'lg';
type IconColor = 'text' | 'dim' | 'faint' | 'accent' | 'success' | 'warn' | 'danger';
```

### Size Reference

| Size | Pixels |
|------|--------|
| `sm` | 16 |
| `md` | 20 |
| `lg` | 28 |

### Examples

```typescript
// Basic usage
<Icon name="home" />
<Icon name="settings-outline" />

// Sizes
<Icon name="star" size="sm" />
<Icon name="star" size="md" />
<Icon name="star" size="lg" />

// Colors
<Icon name="heart" color="danger" />
<Icon name="checkmark-circle" color="success" />
<Icon name="information-circle" color="accent" />

// Common icons
<Icon name="person" />           // Profile
<Icon name="chatbubble" />       // Messages
<Icon name="notifications" />    // Alerts
<Icon name="search" />           // Search
<Icon name="add" />              // Create
<Icon name="close" />            // Dismiss
<Icon name="chevron-forward" />  // Navigate
```

---

## Badge

Compact status indicator.

### Import

```typescript
import { Badge } from '@ariob/andromeda';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | **required** | Badge text (typically uppercase) |
| `tint` | `BadgeTint` | `'default'` | Color variant |
| `style` | `ViewStyle` | - | Additional styles |

### Types

```typescript
type BadgeTint = 'default' | 'accent' | 'success' | 'warn' | 'info';
```

### Examples

```typescript
// Basic usage
<Badge label="NEW" />
<Badge label="BETA" tint="accent" />

// Status indicators
<Badge label="ACTIVE" tint="success" />
<Badge label="PENDING" tint="warn" />
<Badge label="OFFLINE" tint="default" />

// In context
<Row align="center" gap="sm">
  <Text>Feature Name</Text>
  <Badge label="BETA" tint="accent" />
</Row>
```

---

## Dot

Timeline marker with glow effect.

### Import

```typescript
import { Dot } from '@ariob/andromeda';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `color` | `string` | **required** | Fill and glow color |
| `style` | `ViewStyle` | - | Additional styles |

### Examples

```typescript
// Basic usage
<Dot color="#00E5FF" />

// With degree colors
<Dot color={theme.colors.degree[0]} /> // Me
<Dot color={theme.colors.degree[1]} /> // Friends
<Dot color={theme.colors.degree[2]} /> // World

// In a timeline
<Row>
  <Stack align="center">
    <Line />
    <Dot color={theme.colors.accent} />
    <Line />
  </Stack>
  <View style={{ flex: 1 }}>
    <Text>Timeline Item</Text>
  </View>
</Row>
```

---

## Line

Timeline connector line.

### Import

```typescript
import { Line } from '@ariob/andromeda';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `show` | `boolean` | `true` | Whether to render |
| `style` | `ViewStyle` | - | Additional styles |

### Examples

```typescript
// Basic usage
<Line />

// Conditional
<Line show={!isLast} />

// In a timeline
<Stack>
  <Row>
    <Stack align="center" style={{ width: 20 }}>
      <Line show={false} />
      <Dot color={theme.colors.accent} />
      <Line />
    </Stack>
    <Text>First item</Text>
  </Row>
  <Row>
    <Stack align="center" style={{ width: 20 }}>
      <Line />
      <Dot color={theme.colors.success} />
      <Line show={false} />
    </Stack>
    <Text>Last item</Text>
  </Row>
</Stack>
```

---

## Divider

Section separator.

### Import

```typescript
import { Divider } from '@ariob/andromeda';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `orientation` | `DividerOrientation` | `'horizontal'` | Direction |
| `thickness` | `DividerThickness` | `'thin'` | Line thickness |
| `style` | `ViewStyle` | - | Additional styles |

### Types

```typescript
type DividerOrientation = 'horizontal' | 'vertical';
type DividerThickness = 'thin' | 'thick';
```

### Examples

```typescript
// Basic horizontal
<Divider />

// Thick divider
<Divider thickness="thick" />

// Vertical divider
<Row align="center">
  <Text>Left</Text>
  <Divider orientation="vertical" />
  <Text>Right</Text>
</Row>

// Between sections
<Stack gap="md">
  <Text>Section 1 content</Text>
  <Divider />
  <Text>Section 2 content</Text>
</Stack>
```

---

## Label

Form field label.

### Import

```typescript
import { Label } from '@ariob/andromeda';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | **required** | Label text |
| `required` | `boolean` | `false` | Show required indicator (*) |
| `error` | `boolean` | `false` | Show error state |
| `style` | `ViewStyle` | - | Additional styles |

### Examples

```typescript
// Basic usage
<Label>Username</Label>

// Required field
<Label required>Email</Label>

// Error state
<Label error>Password</Label>

// With input
<Stack gap="xs">
  <Label required>Email Address</Label>
  <Input
    value={email}
    onChangeText={setEmail}
    error={!!emailError}
  />
</Stack>
```

---

## Press

Pressable wrapper with haptic feedback.

### Import

```typescript
import { Press } from '@ariob/andromeda';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | **required** | Content |
| `onPress` | `() => void` | - | Tap handler |
| `onLong` | `() => void` | - | Long press handler (500ms) |
| `haptic` | `HapticLevel` | `'light'` | Haptic feedback (iOS) |
| `disabled` | `boolean` | `false` | Disable interaction |
| `style` | `ViewStyle` | - | Additional styles |

### Types

```typescript
type HapticLevel = 'light' | 'medium' | 'heavy' | 'none';
```

### Examples

```typescript
// Basic usage
<Press onPress={handleTap}>
  <Text>Tap me</Text>
</Press>

// Long press
<Press onPress={handleTap} onLong={handleLongPress}>
  <Text>Tap or hold</Text>
</Press>

// Haptic levels
<Press haptic="light" onPress={action}>...</Press>
<Press haptic="medium" onPress={action}>...</Press>
<Press haptic="heavy" onPress={action}>...</Press>
<Press haptic="none" onPress={action}>...</Press>

// Custom pressable card
<Press
  onPress={() => router.push('/details')}
  haptic="medium"
  style={{
    backgroundColor: theme.colors.surface,
    padding: theme.space.md,
    borderRadius: theme.radii.md,
  }}
>
  <Text size="heading">Card Title</Text>
  <Text color="dim">Card description</Text>
</Press>
```
