# Primitive Components

This directory contains primitive layout and UI components built for the Lynx framework using Tailwind CSS. These components follow the same patterns as our existing UI components (`button.tsx`, `card.tsx`) with class-variance-authority (cva) for consistent styling and TypeScript for type safety.

## Components Overview

### Layout Primitives

#### `Column`
Vertical layout container using Flexbox.

```tsx
import { Column } from '@/components/primitives';

<Column spacing="md" align="center" justify="start">
  <text>Item 1</text>
  <text>Item 2</text>
</Column>
```

**Variants:**
- `spacing`: `none | xs | sm | md | lg | xl`
- `align`: `start | center | end | stretch`
- `justify`: `start | center | end | between | around | evenly`
- `width`: `auto | full | fit | screen`
- `height`: `auto | full | fit | screen`

#### `Row`
Horizontal layout container using Flexbox.

```tsx
import { Row } from '@/components/primitives';

<Row gap="sm" justify="between" align="center" wrap="wrap">
  <text>Item 1</text>
  <text>Item 2</text>
</Row>
```

**Variants:**
- `gap`: `none | xs | sm | md | lg | xl`
- `align`: `start | center | end | stretch | baseline`
- `justify`: `start | center | end | between | around | evenly`
- `wrap`: `wrap | nowrap | reverse`
- `width`: `auto | full | fit | screen`
- `height`: `auto | full | fit | screen`

### Scrollable Components

#### `Scrollable`
Wrapper for Lynx's `<scroll-view>` element with enhanced styling options.

```tsx
import { Scrollable } from '@/components/primitives';

<Scrollable 
  direction="vertical" 
  height="screen" 
  padding="md"
  className="max-h-64"
>
  {/* Scrollable content */}
</Scrollable>
```

**Variants:**
- `direction`: `vertical | horizontal | both`
- `gap`: `none | xs | sm | md | lg | xl`
- `padding`: `none | xs | sm | md | lg | xl`
- `width`: `auto | full | fit | screen`
- `height`: `auto | full | fit | screen`
- `showScrollbar`: `auto | hidden | visible`

**Props:**
- `onScrollEnd`: Callback when scrolling ends
- `onScrollStart`: Callback when scrolling starts

### List Components

#### `List`
High-performance list component using Lynx's `<list>` element with lazy loading and view reuse.

```tsx
import { List } from '@/components/primitives';

// Data-driven approach
<List
  data={items}
  renderItem={(item, index) => <ListItem title={item.title} />}
  keyExtractor={(item) => item.id}
  onItemPress={(item) => console.log(item)}
/>

// Children approach
<List>
  <ListItem title="Item 1" />
  <ListItem title="Item 2" />
</List>
```

**Variants:**
- `direction`: `vertical | horizontal`
- `gap`: `none | xs | sm | md | lg | xl`
- `padding`: `none | xs | sm | md | lg | xl`
- `variant`: `default | bordered | elevated | inset`
- `width`: `auto | full | fit | screen`
- `height`: `auto | full | fit | screen`
- `showScrollbar`: `auto | hidden | visible`

**Props:**
- `data`: Array of items for data-driven rendering
- `renderItem`: Function to render each item
- `keyExtractor`: Function to extract unique keys
- `onItemPress`: Callback when item is pressed
- `onEndReached`: Callback when list end is reached
- `emptyComponent`: Component to show when list is empty
- `headerComponent`: Component to show at list top
- `footerComponent`: Component to show at list bottom

#### `ListItem`
Individual list item component with structured content support.

```tsx
import { ListItem } from '@/components/primitives';

// Structured content
<ListItem
  variant="bordered"
  size="md"
  title="Item Title"
  subtitle="Item Subtitle"
  description="Additional details"
  leftElement={<Icon name="user" />}
  rightElement={<Button size="sm">Action</Button>}
  onPress={() => console.log('pressed')}
  selected={isSelected}
/>

// Custom content
<ListItem variant="card" size="lg">
  <text>Custom content goes here</text>
</ListItem>
```

**Variants:**
- `variant`: `default | ghost | bordered | card | none`
- `size`: `sm | md | lg`
- `state`: `default | selected | disabled | active`
- `align`: `start | center | end | between`
- `direction`: `row | column`

**Props:**
- `title`: Main title text
- `subtitle`: Secondary text
- `description`: Additional details text
- `leftElement`: Component to show on the left
- `rightElement`: Component to show on the right
- `onPress`: Callback when item is pressed
- `selected`: Whether item is selected
- `disabled`: Whether item is disabled

## Design Principles

### Lynx Framework Integration
- Uses Lynx elements (`<view>`, `<text>`, `<scroll-view>`, `<list>`) instead of HTML elements
- Event handling with `bindtap` instead of `onClick`
- Optimized for cross-platform native rendering

### Consistent Styling
- All components use class-variance-authority (cva) for variant management
- Follows same patterns as existing UI components
- Tailwind CSS classes for all styling
- `data-slot` attributes for component identification

### TypeScript Support
- Full TypeScript support with proper prop types
- Generic support for `List<T>` with custom data types
- Extends React component props for each respective Lynx element

### Performance Considerations
- `List` component uses Lynx's high-performance list implementation
- `Scrollable` component optimizes scroll behavior
- Proper memoization in examples to prevent unnecessary re-renders

## Usage Examples

See `examples.tsx` for comprehensive usage examples including:

1. **Basic Layout Example** - Simple Column and Row compositions
2. **Scrollable Example** - Vertical scrolling with many items
3. **Performant List Example** - Data-driven list with selection
4. **Manual List Example** - List with manually crafted ListItems
5. **Complex Layout Example** - Dashboard-style composition using all primitives

## Best Practices

1. **Performance**: Use `List` for large datasets, `Scrollable` for simpler scrolling needs
2. **Layout**: Prefer `Column` and `Row` over manual flexbox classes
3. **Consistency**: Use variant props instead of custom className overrides when possible
4. **Accessibility**: Include proper event handlers and state management
5. **Type Safety**: Use TypeScript generics with `List<T>` for type-safe data handling

## Integration with Existing Components

These primitives work seamlessly with existing UI components:

```tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Column, Row, List, ListItem } from '@/components/primitives';

<Card>
  <CardContent>
    <Column gap="md">
      <Row justify="between">
        <text>Header</text>
        <Button>Action</Button>
      </Row>
      <List>
        <ListItem title="Item 1" />
        <ListItem title="Item 2" />
      </List>
    </Column>
  </CardContent>
</Card>
``` 