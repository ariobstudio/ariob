# Molecules

Simple combinations of atoms that form functional units.

---

## Overview

Molecules combine multiple atoms into reusable patterns. They're more opinionated than atoms but remain flexible.

| Component | Composition | Purpose |
|-----------|-------------|---------|
| [Avatar](#avatar) | Text/Icon + Container | User identity |
| [IconButton](#iconbutton) | Icon + Press | Icon-only actions |
| [InputField](#inputfield) | Label + Input + Error | Complete form field |
| [Tag](#tag) | Badge + Close button | Removable labels |

---

## Avatar

User identity representation.

### Import

```typescript
import { Avatar } from '@ariob/andromeda';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `char` | `string` | - | 1-2 character initials |
| `icon` | `string` | - | Ionicons name (overrides char) |
| `size` | `AvatarSize` | `'md'` | Size preset |
| `tint` | `AvatarTint` | `'default'` | Color tint |
| `onPress` | `() => void` | - | Makes avatar pressable |
| `style` | `ViewStyle` | - | Additional styles |

### Types

```typescript
type AvatarSize = 'sm' | 'md' | 'lg';
type AvatarTint = 'default' | 'accent' | 'success' | 'warn';
```

### Size Reference

| Size | Dimension | Font Size | Icon Size |
|------|-----------|-----------|-----------|
| `sm` | 24 | 10 | 14 |
| `md` | 32 | 14 | 18 |
| `lg` | 64 | 28 | 32 |

### Examples

```typescript
// With initials
<Avatar char="JD" />
<Avatar char="A" tint="accent" />

// With icon
<Avatar icon="person" />
<Avatar icon="robot" tint="success" />

// Sizes
<Avatar char="S" size="sm" />
<Avatar char="M" size="md" />
<Avatar char="L" size="lg" />

// Pressable
<Avatar
  char="JD"
  onPress={() => router.push('/profile')}
/>

// In a user row
<Row align="center" gap="sm">
  <Avatar char="JD" tint="accent" />
  <Stack gap="xxs">
    <Text size="body">John Doe</Text>
    <Text size="caption" color="dim">@johndoe</Text>
  </Stack>
</Row>

// AI companion avatar
<Avatar icon="sparkles" tint="warn" size="lg" />
```

---

## IconButton

Icon-only button with press feedback.

### Import

```typescript
import { IconButton } from '@ariob/andromeda';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `string` | **required** | Ionicons name |
| `onPress` | `() => void` | **required** | Press handler |
| `size` | `IconButtonSize` | `'md'` | Size preset |
| `tint` | `IconButtonTint` | `'default'` | Color tint |
| `disabled` | `boolean` | `false` | Disable interaction |
| `style` | `ViewStyle` | - | Additional styles |

### Types

```typescript
type IconButtonSize = 'sm' | 'md' | 'lg';
type IconButtonTint = 'default' | 'accent' | 'success' | 'danger';
```

### Size Reference

| Size | Dimension | Icon Size |
|------|-----------|-----------|
| `sm` | 32 | 16 |
| `md` | 40 | 20 |
| `lg` | 48 | 24 |

### Examples

```typescript
// Basic usage
<IconButton icon="settings" onPress={openSettings} />

// Sizes
<IconButton icon="add" size="sm" onPress={action} />
<IconButton icon="add" size="md" onPress={action} />
<IconButton icon="add" size="lg" onPress={action} />

// Tints
<IconButton icon="heart" tint="danger" onPress={like} />
<IconButton icon="checkmark" tint="success" onPress={confirm} />
<IconButton icon="share" tint="accent" onPress={share} />

// Disabled
<IconButton icon="send" disabled onPress={send} />

// In a toolbar
<Row justify="between" align="center">
  <IconButton icon="arrow-back" onPress={goBack} />
  <Text size="heading">Title</Text>
  <IconButton icon="ellipsis-horizontal" onPress={openMenu} />
</Row>

// Action group
<Row gap="sm">
  <IconButton icon="heart-outline" onPress={like} />
  <IconButton icon="chatbubble-outline" onPress={comment} />
  <IconButton icon="share-outline" onPress={share} />
  <IconButton icon="bookmark-outline" onPress={save} />
</Row>
```

---

## InputField

Complete form field with label and error handling.

### Import

```typescript
import { InputField } from '@ariob/andromeda';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | **required** | Field label |
| `value` | `string` | **required** | Current value |
| `onChangeText` | `(text: string) => void` | **required** | Change handler |
| `placeholder` | `string` | - | Placeholder text |
| `error` | `string` | - | Error message (shows error state) |
| `hint` | `string` | - | Hint text below input |
| `required` | `boolean` | `false` | Show required indicator |
| `disabled` | `boolean` | `false` | Disable interaction |
| `multiline` | `boolean` | `false` | Enable multiline |
| `autoFocus` | `boolean` | `false` | Auto focus on mount |
| `variant` | `InputVariant` | `'outline'` | Visual style |
| `size` | `InputSize` | `'md'` | Size preset |
| `style` | `ViewStyle` | - | Additional styles |
| `...rest` | `RNTextInputProps` | - | All TextInput props |

### Examples

```typescript
// Basic usage
<InputField
  label="Username"
  value={username}
  onChangeText={setUsername}
  placeholder="Enter username"
/>

// Required field
<InputField
  label="Email"
  value={email}
  onChangeText={setEmail}
  required
  keyboardType="email-address"
/>

// With error
<InputField
  label="Password"
  value={password}
  onChangeText={setPassword}
  error={passwordError}
  secureTextEntry
/>

// With hint
<InputField
  label="Bio"
  value={bio}
  onChangeText={setBio}
  hint="Max 160 characters"
  multiline
  numberOfLines={3}
/>

// Complete form
<Stack gap="md">
  <InputField
    label="Full Name"
    value={name}
    onChangeText={setName}
    required
    autoFocus
  />
  <InputField
    label="Email Address"
    value={email}
    onChangeText={setEmail}
    error={emailError}
    required
    keyboardType="email-address"
    autoCapitalize="none"
  />
  <InputField
    label="Password"
    value={password}
    onChangeText={setPassword}
    error={passwordError}
    required
    secureTextEntry
    hint="At least 8 characters"
  />
  <Button onPress={handleSubmit}>
    Create Account
  </Button>
</Stack>
```

---

## Tag

Removable label/filter.

### Import

```typescript
import { Tag } from '@ariob/andromeda';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | **required** | Tag text |
| `tint` | `TagTint` | `'default'` | Color tint |
| `onRemove` | `() => void` | - | Remove handler (shows X) |
| `style` | `ViewStyle` | - | Additional styles |

### Types

```typescript
type TagTint = 'default' | 'accent' | 'success' | 'warn';
```

### Examples

```typescript
// Basic usage
<Tag label="React Native" />

// With color tints
<Tag label="Active" tint="success" />
<Tag label="Pending" tint="warn" />
<Tag label="Featured" tint="accent" />

// Removable
<Tag label="Filter" onRemove={() => removeFilter('filter')} />

// Tag list
<Row gap="sm" style={{ flexWrap: 'wrap' }}>
  {tags.map((tag) => (
    <Tag
      key={tag}
      label={tag}
      onRemove={() => removeTag(tag)}
    />
  ))}
</Row>

// Selected filters
<Stack gap="sm">
  <Text size="caption" color="dim">Active Filters:</Text>
  <Row gap="xs" style={{ flexWrap: 'wrap' }}>
    <Tag label="Friends" tint="accent" onRemove={clearFriends} />
    <Tag label="Recent" tint="success" onRemove={clearRecent} />
    <Tag label="Unread" tint="warn" onRemove={clearUnread} />
  </Row>
</Stack>

// Category badges (non-removable)
<Row gap="xs">
  <Tag label="Design" tint="accent" />
  <Tag label="Development" tint="success" />
  <Tag label="Marketing" tint="warn" />
</Row>
```

---

## Composition Examples

### User Card

```typescript
function UserCard({ user, onPress }) {
  return (
    <Press onPress={onPress} haptic="light">
      <Row align="center" gap="md" style={styles.card}>
        <Avatar
          char={user.name[0]}
          tint={user.isOnline ? 'success' : 'default'}
          size="lg"
        />
        <Stack gap="xs" style={{ flex: 1 }}>
          <Row align="center" gap="sm">
            <Text size="heading">{user.name}</Text>
            {user.isVerified && (
              <Icon name="checkmark-circle" color="accent" size="sm" />
            )}
          </Row>
          <Text size="caption" color="dim">@{user.handle}</Text>
          <Row gap="xs">
            {user.tags.map(tag => (
              <Tag key={tag} label={tag} tint="accent" />
            ))}
          </Row>
        </Stack>
        <IconButton
          icon="chevron-forward"
          onPress={onPress}
        />
      </Row>
    </Press>
  );
}
```

### Action Header

```typescript
function ActionHeader({ title, onBack, onMore }) {
  return (
    <Row justify="between" align="center" style={styles.header}>
      <IconButton icon="arrow-back" onPress={onBack} />
      <Text size="heading">{title}</Text>
      <IconButton icon="ellipsis-horizontal" onPress={onMore} />
    </Row>
  );
}
```

### Search Bar

```typescript
function SearchBar({ value, onChange, onClear }) {
  return (
    <Row align="center" gap="sm" style={styles.searchBar}>
      <Icon name="search" color="dim" />
      <Input
        value={value}
        onChangeText={onChange}
        placeholder="Search..."
        variant="ghost"
        style={{ flex: 1 }}
      />
      {value.length > 0 && (
        <IconButton
          icon="close-circle"
          size="sm"
          onPress={onClear}
        />
      )}
    </Row>
  );
}
```
