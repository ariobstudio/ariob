# Layout Primitives

This directory contains foundational layout components that serve as building blocks for creating complex user interfaces in Lynx applications. These primitives provide consistent spacing, alignment, and structural patterns using Tailwind CSS and class-variance-authority.

## Overview

Layout primitives are low-level components that handle:
- **Flexbox layouts** with Column and Row components
- **Scrolling behavior** with customizable scroll containers
- **List rendering** with optimized list components
- **Responsive design** with consistent spacing scales
- **Cross-platform compatibility** using native Lynx elements

## Architecture Principles

1. **Composability**: Primitives can be nested and combined to create complex layouts
2. **Consistency**: Standardized spacing and sizing scales across all components
3. **Performance**: Optimized rendering with minimal DOM manipulation
4. **Flexibility**: Extensive variant options for different use cases
5. **Type Safety**: Full TypeScript support with exported interfaces

## Component Reference

### Column

Vertical flex container for stacking elements with consistent spacing.

```tsx
import { Column } from '@ariob/ui';

// Basic column with spacing
<Column spacing="md">
  <text>First item</text>
  <text>Second item</text>
  <text>Third item</text>
</Column>

// Centered column
<Column spacing="lg" align="center" justify="center" height="screen">
  <text className="text-2xl">Centered Content</text>
  <Button>Action</Button>
</Column>

// Full-width column with stretch
<Column spacing="sm" align="stretch" width="full">
  <Input placeholder="Full width input" />
  <Button>Full width button</Button>
</Column>
```

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `spacing` | `none \| xs \| sm \| md \| lg \| xl` | Gap between children |
| `align` | `start \| center \| end \| stretch` | Horizontal alignment (cross-axis) |
| `justify` | `start \| center \| end \| between \| around \| evenly` | Vertical distribution (main-axis) |
| `width` | `auto \| full \| fit \| screen` | Container width |
| `height` | `auto \| full \| fit \| screen` | Container height |
| `padding` | `none \| xs \| sm \| md \| lg \| xl` | Internal padding |
| `className` | `string` | Additional Tailwind classes |

**Spacing Scale:**
- `none`: 0
- `xs`: 0.25rem (4px)
- `sm`: 0.5rem (8px)
- `md`: 1rem (16px)
- `lg`: 1.5rem (24px)
- `xl`: 2rem (32px)

### Row

Horizontal flex container for arranging elements side by side.

```tsx
import { Row } from '@ariob/ui';

// Basic row with gap
<Row gap="sm">
  <Button>Save</Button>
  <Button variant="outline">Cancel</Button>
</Row>

// Space between items
<Row justify="between" align="center">
  <text className="font-bold">Title</text>
  <Icon name="chevron-right" />
</Row>

// Wrapping row for responsive layout
<Row gap="md" wrap="wrap">
  {tags.map(tag => (
    <view key={tag} className="px-3 py-1 bg-primary/10 rounded">
      <text>{tag}</text>
    </view>
  ))}
</Row>

// Baseline alignment for text
<Row gap="xs" align="baseline">
  <text className="text-2xl">$99</text>
  <text className="text-sm text-muted">/month</text>
</Row>
```

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `gap` | `none \| xs \| sm \| md \| lg \| xl` | Gap between children |
| `align` | `start \| center \| end \| stretch \| baseline` | Vertical alignment (cross-axis) |
| `justify` | `start \| center \| end \| between \| around \| evenly` | Horizontal distribution (main-axis) |
| `wrap` | `wrap \| nowrap \| reverse` | Flex wrap behavior |
| `width` | `auto \| full \| fit \| screen` | Container width |
| `height` | `auto \| full \| fit \| screen` | Container height |
| `padding` | `none \| xs \| sm \| md \| lg \| xl` | Internal padding |
| `className` | `string` | Additional Tailwind classes |

**Alignment Options:**
- `baseline`: Aligns children along their text baseline (useful for mixed text sizes)

### Scrollable

Container with customizable scrolling behavior and scrollbar styling.

```tsx
import { Scrollable } from '@ariob/ui';

// Vertical scrolling
<Scrollable direction="vertical" height="full" showScrollbar="auto">
  <Column spacing="md">
    {longContent.map((item, i) => (
      <Card key={i}>{item}</Card>
    ))}
  </Column>
</Scrollable>

// Horizontal scrolling for carousel
<Scrollable direction="horizontal" showScrollbar="never">
  <Row gap="md" className="px-4">
    {images.map(src => (
      <image key={src} source={src} className="w-64 h-40" />
    ))}
  </Row>
</Scrollable>

// Both directions with max height
<Scrollable
  direction="both"
  maxHeight="h-96"
  showScrollbar="always"
  className="border rounded"
>
  <table>{/* Large table content */}</table>
</Scrollable>

// iOS bounce effect
<Scrollable direction="vertical" bounce={true}>
  {/* Pull-to-refresh compatible content */}
</Scrollable>
```

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `direction` | `horizontal \| vertical \| both` | Scroll direction(s) |
| `showScrollbar` | `always \| never \| auto` | Scrollbar visibility |
| `bounce` | `boolean` | iOS bounce effect (default: false) |
| `height` | `auto \| full \| fit \| screen` | Container height |
| `maxHeight` | `string` | Maximum height (Tailwind class) |
| `width` | `auto \| full \| fit \| screen` | Container width |
| `padding` | `none \| xs \| sm \| md \| lg \| xl` | Internal padding |
| `className` | `string` | Additional Tailwind classes |

**Platform Notes:**
- iOS: Native scroll with momentum and bounce
- Android: Native scroll with overscroll effects
- Web: CSS overflow with custom scrollbar styling

### List

Optimized list container with consistent spacing and optional dividers.

```tsx
import { List, ListItem } from '@ariob/ui';

// Simple list with dividers
<List divider spacing="none">
  <ListItem title="Profile" icon="user" arrow />
  <ListItem title="Settings" icon="settings" arrow />
  <ListItem title="Help" icon="help-circle" arrow />
  <ListItem title="Sign Out" icon="log-out" />
</List>

// Bordered list with spacing
<List variant="bordered" spacing="sm">
  <ListItem
    title="Notifications"
    subtitle="Manage your notification preferences"
    icon="bell"
    onPress={() => navigate('/notifications')}
  />
  <ListItem
    title="Privacy"
    subtitle="Control your privacy settings"
    icon="shield"
    onPress={() => navigate('/privacy')}
  />
</List>

// Separated list items
<List variant="separated" spacing="md">
  {items.map(item => (
    <ListItem
      key={item.id}
      title={item.name}
      subtitle={item.description}
      icon={item.icon}
      onPress={() => handleSelect(item)}
    />
  ))}
</List>

// Custom list item content
<List>
  <ListItem>
    <Row justify="between" align="center">
      <Column spacing="xs">
        <text className="font-medium">Custom Layout</text>
        <text className="text-sm text-muted">With any content</text>
      </Column>
      <Switch checked={enabled} onCheckedChange={setEnabled} />
    </Row>
  </ListItem>
</List>
```

**List Props:**

| Prop | Type | Description |
|------|------|-------------|
| `spacing` | `none \| xs \| sm \| md \| lg` | Space between items |
| `divider` | `boolean` | Show dividers between items |
| `variant` | `default \| bordered \| separated` | List style variant |
| `className` | `string` | Additional Tailwind classes |

**List Variants:**
- `default`: No container styling
- `bordered`: Border around entire list
- `separated`: Individual borders for each item

### ListItem

Individual list item with built-in layouts for common patterns.

```tsx
import { ListItem } from '@ariob/ui';

// Simple clickable item
<ListItem
  title="Settings"
  onPress={() => navigate('/settings')}
/>

// With icon and arrow
<ListItem
  title="Account"
  icon="user"
  arrow
  onPress={() => navigate('/account')}
/>

// With subtitle
<ListItem
  title="Storage"
  subtitle="5.2 GB of 15 GB used"
  icon="hard-drive"
/>

// With custom action
<ListItem
  title="Dark Mode"
  subtitle="Use dark theme"
  icon="moon"
>
  <Switch checked={darkMode} onCheckedChange={setDarkMode} />
</ListItem>

// Destructive action
<ListItem
  title="Delete Account"
  subtitle="This action cannot be undone"
  icon="trash"
  variant="destructive"
  onPress={handleDelete}
/>
```

**ListItem Props:**

| Prop | Type | Description |
|------|------|-------------|
| `title` | `string` | Primary text |
| `subtitle` | `string` | Secondary text |
| `icon` | `string` | Leading icon name |
| `arrow` | `boolean` | Show trailing arrow |
| `variant` | `default \| destructive` | Item style variant |
| `disabled` | `boolean` | Disable interactions |
| `onPress` | `() => void` | Press handler |
| `children` | `ReactNode` | Custom content (replaces default layout) |
| `className` | `string` | Additional Tailwind classes |

## Usage Patterns

### Form Layout

```tsx
function FormExample() {
  return (
    <Column spacing="lg" padding="md">
      <Column spacing="sm">
        <text className="text-sm font-medium">Email</text>
        <Input type="email" placeholder="Enter your email" />
      </Column>

      <Column spacing="sm">
        <text className="text-sm font-medium">Password</text>
        <Input type="password" placeholder="Enter password" />
      </Column>

      <Row gap="sm" justify="end">
        <Button variant="outline">Cancel</Button>
        <Button>Submit</Button>
      </Row>
    </Column>
  );
}
```

### Responsive Grid

```tsx
function GridLayout() {
  return (
    <Row wrap="wrap" gap="md">
      {items.map(item => (
        <view key={item.id} className="w-full sm:w-1/2 lg:w-1/3">
          <Card>
            <CardContent>{item.content}</CardContent>
          </Card>
        </view>
      ))}
    </Row>
  );
}
```

### Settings Screen

```tsx
function SettingsScreen() {
  return (
    <Scrollable direction="vertical" height="screen">
      <Column spacing="lg" padding="md">
        <text className="text-2xl font-bold">Settings</text>

        <Column spacing="md">
          <text className="text-sm text-muted uppercase">Account</text>
          <List variant="bordered">
            <ListItem title="Profile" icon="user" arrow />
            <ListItem title="Security" icon="shield" arrow />
            <ListItem title="Privacy" icon="lock" arrow />
          </List>
        </Column>

        <Column spacing="md">
          <text className="text-sm text-muted uppercase">Preferences</text>
          <List variant="bordered">
            <ListItem title="Notifications" icon="bell" arrow />
            <ListItem title="Appearance" icon="palette" arrow />
            <ListItem title="Language" icon="globe" arrow />
          </List>
        </Column>

        <Column spacing="md">
          <text className="text-sm text-muted uppercase">Support</text>
          <List variant="bordered">
            <ListItem title="Help Center" icon="help-circle" arrow />
            <ListItem title="Contact Us" icon="message-circle" arrow />
            <ListItem title="About" icon="info" arrow />
          </List>
        </Column>
      </Column>
    </Scrollable>
  );
}
```

### Dashboard Cards

```tsx
function Dashboard() {
  return (
    <Scrollable height="screen">
      <Column spacing="lg" padding="lg">
        {/* Stats Row */}
        <Row gap="md">
          <Card className="flex-1">
            <CardContent>
              <Column spacing="xs">
                <text className="text-sm text-muted">Revenue</text>
                <text className="text-2xl font-bold">$12,345</text>
              </Column>
            </CardContent>
          </Card>

          <Card className="flex-1">
            <CardContent>
              <Column spacing="xs">
                <text className="text-sm text-muted">Users</text>
                <text className="text-2xl font-bold">1,234</text>
              </Column>
            </CardContent>
          </Card>
        </Row>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <List divider spacing="none">
              {activities.map(activity => (
                <ListItem
                  key={activity.id}
                  title={activity.title}
                  subtitle={activity.time}
                  icon={activity.icon}
                />
              ))}
            </List>
          </CardContent>
        </Card>
      </Column>
    </Scrollable>
  );
}
```

## Advanced Techniques

### Nested Scrollables

```tsx
// Horizontal scroll within vertical scroll
<Scrollable direction="vertical" height="screen">
  <Column spacing="lg">
    <text className="text-xl font-bold px-4">Featured</text>
    <Scrollable direction="horizontal" showScrollbar="never">
      <Row gap="md" className="px-4">
        {featured.map(item => (
          <Card key={item.id} className="w-64">
            {/* Card content */}
          </Card>
        ))}
      </Row>
    </Scrollable>

    <text className="text-xl font-bold px-4">Recent</text>
    <Column spacing="md" padding="md">
      {recent.map(item => (
        <Card key={item.id}>{/* Card content */}</Card>
      ))}
    </Column>
  </Column>
</Scrollable>
```

### Dynamic Layouts

```tsx
function DynamicLayout({ orientation }) {
  const Container = orientation === 'horizontal' ? Row : Column;
  const spacing = orientation === 'horizontal' ? 'gap' : 'spacing';

  return (
    <Container {...{ [spacing]: 'md' }} className="p-4">
      <Button>First</Button>
      <Button>Second</Button>
      <Button>Third</Button>
    </Container>
  );
}
```

### Virtualized Lists

```tsx
import { VirtualList } from '@ariob/ui'; // Future component

function LargeList({ items }) {
  return (
    <VirtualList
      data={items}
      height={600}
      itemHeight={80}
      renderItem={({ item, index }) => (
        <ListItem
          key={item.id}
          title={item.name}
          subtitle={`Item ${index + 1}`}
        />
      )}
    />
  );
}
```

## Performance Optimization

### Memoization

```tsx
import { memo } from '@lynx-js/react';

const ExpensiveList = memo(({ items }) => (
  <List>
    {items.map(item => (
      <ListItem key={item.id} {...item} />
    ))}
  </List>
));
```

### Lazy Loading

```tsx
function LazyContent() {
  const [visible, setVisible] = useState(false);

  return (
    <Column spacing="md">
      <Button onPress={() => setVisible(!visible)}>
        Toggle Content
      </Button>
      {visible && (
        <Suspense fallback={<text>Loading...</text>}>
          <LazyComponent />
        </Suspense>
      )}
    </Column>
  );
}
```

## Accessibility

All primitives include:

1. **Semantic Structure**: Proper element hierarchy
2. **Keyboard Navigation**: Tab order and focus management
3. **Screen Reader Support**: ARIA labels where appropriate
4. **Focus Indicators**: Visible focus states
5. **Touch Targets**: Minimum 44x44px touch areas

```tsx
// Accessible list example
<List role="navigation" aria-label="Main menu">
  <ListItem
    title="Home"
    icon="home"
    role="menuitem"
    aria-current="page"
  />
  <ListItem
    title="Settings"
    icon="settings"
    role="menuitem"
  />
</List>
```

## Testing

### Component Testing

```tsx
import { render, screen } from '@testing-library/react-native';

describe('Column', () => {
  it('renders children with spacing', () => {
    render(
      <Column spacing="md" testID="column">
        <text>Child 1</text>
        <text>Child 2</text>
      </Column>
    );

    const column = screen.getByTestId('column');
    expect(column).toHaveStyle({ gap: 16 });
  });
});
```

### Visual Regression Testing

```tsx
import { Column, Row, List } from '@ariob/ui';

export const PrimitivesStories = {
  column: () => (
    <Column spacing="md" align="center">
      <text>Centered Column</text>
    </Column>
  ),
  row: () => (
    <Row gap="sm" justify="between">
      <text>Left</text>
      <text>Right</text>
    </Row>
  ),
  list: () => (
    <List divider>
      <ListItem title="Item 1" />
      <ListItem title="Item 2" />
    </List>
  ),
};
```

## Migration Guide

### From Flexbox to Primitives

```tsx
// Before: Raw flexbox
<view className="flex flex-col gap-4 items-center">
  <text>Content</text>
</view>

// After: Column primitive
<Column spacing="md" align="center">
  <text>Content</text>
</Column>
```

### From ScrollView to Scrollable

```tsx
// Before: Native ScrollView
<ScrollView style={{ flex: 1 }}>
  {content}
</ScrollView>

// After: Scrollable primitive
<Scrollable direction="vertical" height="full">
  {content}
</Scrollable>
```

## Troubleshooting

### Common Issues

1. **Scroll not working**: Ensure parent has defined height
   ```tsx
   <Scrollable height="full"> {/* or specific height */}
   ```

2. **Flex children not sizing correctly**: Use flex classes
   ```tsx
   <Row>
     <view className="flex-1">Expands</view>
     <view className="flex-shrink-0">Fixed</view>
   </Row>
   ```

3. **List performance**: Use keys and memoization
   ```tsx
   {items.map(item => (
     <ListItem key={item.id} {...item} />
   ))}
   ```

## Resources

- [Main UI Package Documentation](../../README.md)
- [UI Components Documentation](../ui/README.md)
- [Tailwind CSS Flexbox](https://tailwindcss.com/docs/flex)
- [LynxJS Documentation](https://lynxjs.org)
- [Class Variance Authority](https://cva.style/docs)