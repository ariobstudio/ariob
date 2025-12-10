# Organisms

Complex UI sections composed of molecules and atoms.

---

## Overview

Organisms are complete, self-contained UI sections. They handle their own state and can be used directly in screens.

| Component | Purpose |
|-----------|---------|
| [Card](#card) | Content container with header/footer |
| [Toast](#toast) | Notification system |

---

## Card

Structured content container.

### Import

```typescript
import { Card } from '@ariob/andromeda';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | **required** | Card content |
| `header` | `ReactNode` | - | Header slot |
| `footer` | `ReactNode` | - | Footer slot |
| `variant` | `CardVariant` | `'elevated'` | Visual style |
| `onPress` | `() => void` | - | Makes card pressable |
| `style` | `ViewStyle` | - | Additional styles |

### Types

```typescript
type CardVariant = 'elevated' | 'outline' | 'ghost';
```

### Examples

```typescript
// Basic usage
<Card>
  <Text>Card content</Text>
</Card>

// Variants
<Card variant="elevated">Elevated (default)</Card>
<Card variant="outline">Outline border</Card>
<Card variant="ghost">No background</Card>

// With header and footer
<Card
  header={<Text size="heading">Card Title</Text>}
  footer={
    <Row justify="end" gap="sm">
      <Button variant="ghost" onPress={cancel}>Cancel</Button>
      <Button onPress={submit}>Submit</Button>
    </Row>
  }
>
  <Text>This is the card body content.</Text>
</Card>

// Pressable card
<Card onPress={() => router.push('/details')}>
  <Row align="center" gap="md">
    <Avatar char="JD" />
    <Stack gap="xxs">
      <Text size="body">John Doe</Text>
      <Text size="caption" color="dim">Tap to view profile</Text>
    </Stack>
  </Row>
</Card>

// Stats card
<Card>
  <Stack gap="sm">
    <Text size="caption" color="dim">TOTAL POSTS</Text>
    <Text size="title">1,234</Text>
    <Row align="center" gap="xs">
      <Icon name="trending-up" color="success" size="sm" />
      <Text size="caption" color="success">+12% this week</Text>
    </Row>
  </Stack>
</Card>

// Profile card
<Card
  header={
    <Row align="center" gap="md">
      <Avatar char="JD" size="lg" tint="accent" />
      <Stack gap="xxs">
        <Text size="heading">John Doe</Text>
        <Text size="caption" color="dim">@johndoe</Text>
      </Stack>
    </Row>
  }
  footer={
    <Row gap="sm">
      <Button variant="outline" style={{ flex: 1 }} onPress={message}>
        Message
      </Button>
      <Button style={{ flex: 1 }} onPress={follow}>
        Follow
      </Button>
    </Row>
  }
>
  <Text color="dim">
    Building amazing apps with React Native.
    Design systems enthusiast.
  </Text>
</Card>
```

---

## Toast

Notification system with imperative API.

### Setup

Add provider and container to your root layout:

```typescript
// app/_layout.tsx
import { ToastProvider, ToastContainer } from '@ariob/andromeda';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RootLayout() {
  const insets = useSafeAreaInsets();

  return (
    <ToastProvider>
      <Stack />
      <ToastContainer topInset={insets.top} />
    </ToastProvider>
  );
}
```

### Import

```typescript
import { toast } from '@ariob/andromeda';
```

### API

```typescript
// Basic toast
toast('Message sent');

// Variants
toast.success('Profile updated');
toast.error('Connection failed');
toast.warning('Low battery');
toast.info('New features available');

// With options
toast.success('Saved', {
  description: 'Your changes have been saved',
  duration: 5000,
  action: {
    label: 'Undo',
    onPress: handleUndo,
  },
});
```

### Toast Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `description` | `string` | - | Secondary text |
| `duration` | `number` | `3000` | Display time (ms) |
| `action` | `ToastAction` | - | Action button |

### ToastAction

```typescript
interface ToastAction {
  label: string;
  onPress: () => void;
}
```

### Toast Variants

| Variant | Color | Icon | Usage |
|---------|-------|------|-------|
| `default` | text | - | General messages |
| `success` | success | checkmark-circle | Confirmations |
| `error` | danger | alert-circle | Errors |
| `warning` | warn | warning | Warnings |
| `info` | info | information-circle | Information |

### Examples

```typescript
// After successful action
async function handleSave() {
  try {
    await saveData();
    toast.success('Saved!');
  } catch (error) {
    toast.error('Failed to save');
  }
}

// With description
toast.success('Account created', {
  description: 'Welcome to the app!',
});

// With action
toast.error('Message failed', {
  description: 'Could not send your message',
  action: {
    label: 'Retry',
    onPress: () => sendMessage(),
  },
});

// Info with long duration
toast.info('Syncing...', {
  duration: 10000,
  description: 'Downloading latest data',
});

// Warning with action
toast.warning('Unsaved changes', {
  description: 'You have unsaved changes',
  action: {
    label: 'Save',
    onPress: handleSave,
  },
});

// Custom duration
toast('Processing...', { duration: 1500 });
```

### ToastProvider Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | **required** | App content |
| `maxToasts` | `number` | `3` | Max visible toasts |

### ToastContainer Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `topInset` | `number` | `0` | Safe area top inset |

### useToasts Hook

For advanced usage:

```typescript
import { useToasts } from '@ariob/andromeda';

function MyComponent() {
  const { toasts, dismiss, dismissAll } = useToasts();

  return (
    <View>
      <Text>Active toasts: {toasts.length}</Text>
      <Button onPress={dismissAll}>Clear All</Button>
    </View>
  );
}
```

---

## Composition Examples

### Settings Section

```typescript
function SettingsSection({ title, children }) {
  return (
    <Card variant="outline">
      <Stack gap="md">
        <Text size="caption" color="dim">{title.toUpperCase()}</Text>
        <Divider />
        {children}
      </Stack>
    </Card>
  );
}

// Usage
<SettingsSection title="Account">
  <Press onPress={goToProfile}>
    <Row justify="between" align="center">
      <Row align="center" gap="sm">
        <Icon name="person" />
        <Text>Profile</Text>
      </Row>
      <Icon name="chevron-forward" color="dim" />
    </Row>
  </Press>
  <Divider />
  <Press onPress={goToSecurity}>
    <Row justify="between" align="center">
      <Row align="center" gap="sm">
        <Icon name="shield" />
        <Text>Security</Text>
      </Row>
      <Icon name="chevron-forward" color="dim" />
    </Row>
  </Press>
</SettingsSection>
```

### Notification Card

```typescript
function NotificationCard({ notification, onDismiss }) {
  return (
    <Card variant="outline">
      <Row gap="md">
        <Avatar
          char={notification.sender[0]}
          tint={notification.type === 'message' ? 'accent' : 'default'}
        />
        <Stack gap="xs" style={{ flex: 1 }}>
          <Row justify="between">
            <Text size="body">{notification.title}</Text>
            <Text size="caption" color="faint">{notification.time}</Text>
          </Row>
          <Text size="caption" color="dim" numberOfLines={2}>
            {notification.body}
          </Text>
        </Stack>
        <IconButton
          icon="close"
          size="sm"
          onPress={onDismiss}
        />
      </Row>
    </Card>
  );
}
```

### Action Sheet Item

```typescript
function ActionSheetItem({ icon, label, danger, onPress }) {
  return (
    <Press onPress={onPress} haptic="light">
      <Row align="center" gap="md" style={{ padding: 16 }}>
        <Icon
          name={icon}
          color={danger ? 'danger' : 'text'}
        />
        <Text color={danger ? 'danger' : 'text'}>{label}</Text>
      </Row>
    </Press>
  );
}

// Usage
<Card>
  <ActionSheetItem icon="share" label="Share" onPress={share} />
  <Divider />
  <ActionSheetItem icon="bookmark" label="Save" onPress={save} />
  <Divider />
  <ActionSheetItem icon="flag" label="Report" onPress={report} />
  <Divider />
  <ActionSheetItem icon="trash" label="Delete" danger onPress={del} />
</Card>
```
