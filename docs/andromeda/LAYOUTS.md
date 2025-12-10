# Layouts

Container and arrangement utilities.

---

## Overview

Layout components handle spacing, alignment, and scrolling. They abstract common layout patterns into reusable components.

| Component | Purpose |
|-----------|---------|
| [Box](#box) | Generic container with padding |
| [Row](#row) | Horizontal flex container |
| [Stack](#stack) | Vertical flex container |
| [Grid](#grid) | Multi-column grid |
| [Scroll](#scroll) | Scrollable container |

---

## Box

Generic container with padding variants.

### Import

```typescript
import { Box } from '@ariob/andromeda';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | **required** | Content |
| `variant` | `BoxVariant` | - | Background variant |
| `padding` | `BoxPadding` | - | Padding preset |
| `style` | `ViewStyle` | - | Additional styles |

### Types

```typescript
type BoxVariant = 'surface' | 'elevated' | 'muted';
type BoxPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';
```

### Examples

```typescript
// Basic usage
<Box padding="md">
  <Text>Content</Text>
</Box>

// With background
<Box variant="surface" padding="lg">
  <Text>Surface background</Text>
</Box>

<Box variant="elevated" padding="md">
  <Text>Elevated surface</Text>
</Box>

<Box variant="muted" padding="sm">
  <Text>Muted background</Text>
</Box>

// Page container
<Box padding="lg" style={{ flex: 1 }}>
  <Stack gap="md">
    <Text size="title">Page Title</Text>
    <Text>Page content goes here</Text>
  </Stack>
</Box>
```

---

## Row

Horizontal flex container.

### Import

```typescript
import { Row } from '@ariob/andromeda';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | **required** | Content |
| `gap` | `GapSize` | - | Space between items |
| `align` | `Alignment` | `'stretch'` | Cross-axis alignment |
| `justify` | `Justification` | `'start'` | Main-axis justification |
| `wrap` | `boolean` | `false` | Allow wrapping |
| `style` | `ViewStyle` | - | Additional styles |

### Types

```typescript
type GapSize = 'none' | 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
type Alignment = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
type Justification = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
```

### Examples

```typescript
// Basic usage
<Row gap="sm">
  <Text>Item 1</Text>
  <Text>Item 2</Text>
</Row>

// Centered items
<Row align="center" gap="md">
  <Avatar char="A" />
  <Text>Username</Text>
</Row>

// Space between
<Row justify="between" align="center">
  <Text>Left</Text>
  <Text>Right</Text>
</Row>

// Wrapped tags
<Row gap="xs" wrap>
  {tags.map(tag => <Tag key={tag} label={tag} />)}
</Row>

// Header layout
<Row justify="between" align="center" style={{ padding: 16 }}>
  <IconButton icon="arrow-back" onPress={goBack} />
  <Text size="heading">Title</Text>
  <IconButton icon="more-horizontal" onPress={openMenu} />
</Row>

// User info row
<Row align="center" gap="sm">
  <Avatar char="JD" />
  <Stack gap="xxs" style={{ flex: 1 }}>
    <Text size="body">John Doe</Text>
    <Text size="caption" color="dim">@johndoe</Text>
  </Stack>
  <Button size="sm" variant="outline" onPress={follow}>
    Follow
  </Button>
</Row>
```

---

## Stack

Vertical flex container.

### Import

```typescript
import { Stack } from '@ariob/andromeda';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | **required** | Content |
| `gap` | `GapSize` | - | Space between items |
| `align` | `Alignment` | `'stretch'` | Cross-axis alignment |
| `justify` | `Justification` | `'start'` | Main-axis justification |
| `style` | `ViewStyle` | - | Additional styles |

### Types

```typescript
type GapSize = 'none' | 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
type Alignment = 'start' | 'center' | 'end' | 'stretch';
type Justification = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
```

### Examples

```typescript
// Basic usage
<Stack gap="md">
  <Text size="title">Title</Text>
  <Text>Description</Text>
</Stack>

// Centered content
<Stack align="center" justify="center" style={{ flex: 1 }}>
  <Icon name="checkmark-circle" size="lg" color="success" />
  <Text size="heading">Success!</Text>
</Stack>

// Form layout
<Stack gap="lg">
  <InputField label="Email" value={email} onChangeText={setEmail} required />
  <InputField label="Password" value={password} onChangeText={setPassword} secureTextEntry />
  <Button onPress={submit}>Sign In</Button>
</Stack>

// Card content
<Card>
  <Stack gap="sm">
    <Text size="heading">Card Title</Text>
    <Text color="dim">Card description goes here.</Text>
    <Divider />
    <Row justify="end" gap="sm">
      <Button variant="ghost" onPress={cancel}>Cancel</Button>
      <Button onPress={confirm}>Confirm</Button>
    </Row>
  </Stack>
</Card>

// Page layout
<Stack gap="xl" style={{ flex: 1, padding: 20 }}>
  <Stack gap="xs">
    <Text size="title">Welcome Back</Text>
    <Text color="dim">Sign in to continue</Text>
  </Stack>

  <Stack gap="md">
    <InputField label="Email" ... />
    <InputField label="Password" ... />
  </Stack>

  <Stack gap="sm">
    <Button onPress={signIn}>Sign In</Button>
    <Button variant="ghost" onPress={signUp}>Create Account</Button>
  </Stack>
</Stack>
```

---

## Grid

Multi-column grid layout.

### Import

```typescript
import { Grid } from '@ariob/andromeda';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | **required** | Grid items |
| `columns` | `number` | `2` | Number of columns |
| `gap` | `GapSize` | `'md'` | Space between items |
| `style` | `ViewStyle` | - | Additional styles |

### Examples

```typescript
// Basic 2-column grid
<Grid columns={2} gap="md">
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
  <Card>Item 4</Card>
</Grid>

// 3-column grid
<Grid columns={3} gap="sm">
  {items.map(item => (
    <Card key={item.id}>
      <Text>{item.name}</Text>
    </Card>
  ))}
</Grid>

// Photo grid
<Grid columns={3} gap="xs">
  {photos.map(photo => (
    <Press key={photo.id} onPress={() => openPhoto(photo)}>
      <Image
        source={{ uri: photo.url }}
        style={{ aspectRatio: 1, borderRadius: 4 }}
      />
    </Press>
  ))}
</Grid>

// Stats grid
<Grid columns={2} gap="md">
  <Card>
    <Stack gap="xs" align="center">
      <Text size="title">1.2K</Text>
      <Text size="caption" color="dim">Followers</Text>
    </Stack>
  </Card>
  <Card>
    <Stack gap="xs" align="center">
      <Text size="title">856</Text>
      <Text size="caption" color="dim">Following</Text>
    </Stack>
  </Card>
  <Card>
    <Stack gap="xs" align="center">
      <Text size="title">42</Text>
      <Text size="caption" color="dim">Posts</Text>
    </Stack>
  </Card>
  <Card>
    <Stack gap="xs" align="center">
      <Text size="title">12K</Text>
      <Text size="caption" color="dim">Likes</Text>
    </Stack>
  </Card>
</Grid>
```

---

## Scroll

Scrollable container.

### Import

```typescript
import { Scroll } from '@ariob/andromeda';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | **required** | Scrollable content |
| `horizontal` | `boolean` | `false` | Horizontal scrolling |
| `padding` | `BoxPadding` | - | Content padding |
| `showsIndicator` | `boolean` | `true` | Show scroll indicator |
| `style` | `ViewStyle` | - | Additional styles |
| `contentStyle` | `ViewStyle` | - | Content container styles |
| `...rest` | `ScrollViewProps` | - | All ScrollView props |

### Examples

```typescript
// Vertical scroll
<Scroll padding="md">
  <Stack gap="md">
    {items.map(item => (
      <Card key={item.id}>{item.content}</Card>
    ))}
  </Stack>
</Scroll>

// Horizontal scroll
<Scroll horizontal showsIndicator={false}>
  <Row gap="sm" style={{ padding: 16 }}>
    {categories.map(cat => (
      <Press key={cat.id} onPress={() => selectCategory(cat)}>
        <Box variant="surface" padding="sm">
          <Text>{cat.name}</Text>
        </Box>
      </Press>
    ))}
  </Row>
</Scroll>

// Full page scroll
<Scroll
  padding="lg"
  contentStyle={{ paddingBottom: 100 }}
  refreshControl={
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
  }
>
  <Stack gap="xl">
    <ProfileHeader user={user} />
    <Stats stats={user.stats} />
    <PostList posts={user.posts} />
  </Stack>
</Scroll>

// Horizontal card carousel
<Scroll horizontal showsIndicator={false}>
  <Row gap="md" style={{ paddingHorizontal: 16 }}>
    {featured.map(item => (
      <Card key={item.id} style={{ width: 280 }}>
        <Stack gap="sm">
          <Image source={{ uri: item.image }} style={{ height: 160, borderRadius: 8 }} />
          <Text size="heading">{item.title}</Text>
          <Text size="caption" color="dim" numberOfLines={2}>{item.description}</Text>
        </Stack>
      </Card>
    ))}
  </Row>
</Scroll>
```

---

## Composition Patterns

### Page Template

```typescript
function PageTemplate({ title, subtitle, children, actions }) {
  return (
    <Box style={{ flex: 1 }}>
      <Stack gap="xl" style={{ padding: 20 }}>
        <Stack gap="xs">
          <Text size="title">{title}</Text>
          {subtitle && <Text color="dim">{subtitle}</Text>}
        </Stack>

        {children}

        {actions && (
          <Stack gap="sm">
            {actions}
          </Stack>
        )}
      </Stack>
    </Box>
  );
}
```

### List with Dividers

```typescript
function DividedList({ items, renderItem }) {
  return (
    <Stack>
      {items.map((item, index) => (
        <React.Fragment key={item.id}>
          {index > 0 && <Divider />}
          {renderItem(item)}
        </React.Fragment>
      ))}
    </Stack>
  );
}
```

### Responsive Grid

```typescript
function ResponsiveGrid({ items }) {
  const { breakpoint } = useUnistyles();

  const columns = breakpoint === 'xs' ? 1
    : breakpoint === 'sm' ? 2
    : 3;

  return (
    <Grid columns={columns} gap="md">
      {items.map(item => (
        <Card key={item.id}>
          <Text>{item.name}</Text>
        </Card>
      ))}
    </Grid>
  );
}
```
