# Styling Guide

Component styling patterns and best practices for Brana.

## Styling Philosophy

Brana uses a **platform-specific styling approach**:

- **Native (iOS/Android)**: React Native StyleSheet + theme constants + Tailwind utilities
- **Web**: CSS classes + CSS custom properties

This guide provides patterns for both platforms.

---

## Quick Reference

| Task | Native | Web |
|------|--------|-----|
| Static colors | Tailwind classes | CSS classes |
| Dynamic colors | `useThemeColor` hook | CSS variables |
| Typography | `textStyles` constants | CSS variables |
| Layout | StyleSheet or Tailwind | CSS Grid/Flexbox |
| Spacing | `spacing` constants | CSS variables |

---

## Native Components (iOS/Android)

### Pattern 1: Tailwind Classes for Static Styles

**Use for**: Layout, static spacing, simple containers

```tsx
<View className="flex-1 px-4 py-2">
  <Text className="text-lg font-semibold">Title</Text>
</View>
```

**Benefits**:
- Concise syntax
- No StyleSheet boilerplate
- Responsive utilities

### Pattern 2: StyleSheet with Theme Constants

**Use for**: Complex components, dynamic colors, reusable styles

```tsx
import { StyleSheet } from 'react-native';
import { useThemeColor } from '@/constants/theme';
import { textStyles, spacing } from '@/constants/typography';

function MyComponent() {
  const bgColor = useThemeColor('background');
  const textColor = useThemeColor('foreground');

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <Text style={[textStyles.h2, { color: textColor }]}>
        Heading
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    borderRadius: borderRadius.md,
  },
});
```

**Benefits**:
- Type safety
- Performance (styles computed once)
- Clear separation of concerns

### Pattern 3: Inline Styles with Memoization

**Use for**: Highly dynamic styles that depend on props/state

```tsx
import { useMemo } from 'react';
import { useThemeColor } from '@/constants/theme';

function DynamicComponent({ isActive }: { isActive: boolean }) {
  const accentColor = useThemeColor('accent');
  const mutedColor = useThemeColor('muted');

  const containerStyle = useMemo(() => ({
    backgroundColor: isActive ? accentColor : mutedColor,
  }), [isActive, accentColor, mutedColor]);

  return <View style={containerStyle} />;
}
```

**Important**: Always memoize inline style objects to prevent infinite re-renders.

---

## Web Components

### Pattern 1: CSS Classes (Preferred)

**Use for**: All web components

```tsx
// Component
function MyComponent() {
  return (
    <div className="my-component">
      <h2 className="my-component__title">Title</h2>
      <p className="my-component__text">Content</p>
    </div>
  );
}
```

```css
/* global.web.css */
.my-component {
  background-color: var(--background);
  padding: 24px;
  border-radius: 12px;
}

.my-component__title {
  color: var(--foreground);
  font-family: var(--font-bold);
  font-size: 24px;
  line-height: 1.375;
}

.my-component__text {
  color: var(--muted);
  font-family: var(--font-normal);
  font-size: 15px;
  line-height: 1.625;
}
```

**Benefits**:
- CSS cascade and specificity
- Media queries
- Pseudo-classes (:hover, :focus)
- Better performance

---

## Common Component Patterns

### Buttons

**Native**:
```tsx
import { Pressable, Text } from 'react-native';
import { useThemeColor } from '@/constants/theme';
import { textStyles } from '@/constants/typography';

function Button({ title, onPress, variant = 'primary' }: ButtonProps) {
  const accentColor = useThemeColor('accent');
  const mutedColor = useThemeColor('muted');

  const bgColor = variant === 'primary' ? accentColor : 'transparent';
  const textColor = variant === 'primary'
    ? useThemeColor('accent-foreground')
    : mutedColor;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bgColor },
        pressed && styles.buttonPressed,
      ]}
    >
      <Text style={[textStyles.button, { color: textColor }]}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.7,
  },
});
```

**Web**:
```tsx
function Button({ title, onPress, variant = 'primary' }: ButtonProps) {
  return (
    <button
      className={`button button--${variant}`}
      onClick={onPress}
    >
      {title}
    </button>
  );
}
```

```css
.button {
  padding: 12px 16px;
  border-radius: 8px;
  font-family: var(--font-medium);
  font-size: 15px;
  cursor: pointer;
  transition: opacity 150ms ease;
}

.button:active {
  opacity: 0.7;
}

.button--primary {
  background-color: var(--accent);
  color: var(--accent-foreground);
  border: none;
}

.button--secondary {
  background-color: transparent;
  color: var(--muted);
  border: 1.5px solid var(--border);
}
```

### Lists

**Native**:
```tsx
import { FlatList, View, Text } from 'react-native';
import { useThemeColor } from '@/constants/theme';
import { textStyles } from '@/constants/typography';

function MyList({ items }: { items: Item[] }) {
  const bgColor = useThemeColor('background');
  const textColor = useThemeColor('foreground');

  return (
    <FlatList
      data={items}
      renderItem={({ item }) => (
        <View style={[styles.item, { borderBottomColor: useThemeColor('divider') }]}>
          <Text style={[textStyles.body, { color: textColor }]}>
            {item.title}
          </Text>
        </View>
      )}
      style={{ backgroundColor: bgColor }}
    />
  );
}

const styles = StyleSheet.create({
  item: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
});
```

### Form Inputs

**Native**:
```tsx
import { TextInput } from 'react-native';
import { useThemeColor } from '@/constants/theme';

function Input({ value, onChangeText, placeholder }: InputProps) {
  const bgColor = useThemeColor('field-background');
  const textColor = useThemeColor('field-foreground');
  const placeholderColor = useThemeColor('field-placeholder');

  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={placeholderColor as string}
      style={[
        textStyles.body,
        {
          backgroundColor: bgColor as string,
          color: textColor as string,
          ...styles.input,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
});
```

**Web**:
```tsx
function Input({ value, onChange, placeholder }: InputProps) {
  return (
    <input
      className="input"
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  );
}
```

```css
.input {
  background-color: var(--field-background);
  color: var(--field-foreground);
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid transparent;
  font-family: var(--font-normal);
  font-size: 15px;
  line-height: 1.5;
}

.input::placeholder {
  color: var(--field-placeholder);
}

.input:focus {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
```

---

## Anti-Patterns

### ❌ Hardcoded Colors

```tsx
// BAD
<View style={{ backgroundColor: '#000000' }} />

// GOOD
const bgColor = useThemeColor('background');
<View style={{ backgroundColor: bgColor }} />
```

### ❌ Magic Numbers

```tsx
// BAD
<View style={{ padding: 12, marginTop: 16 }} />

// GOOD
import { spacing } from '@/constants/theme';
<View style={{ padding: spacing.md, marginTop: spacing.lg }} />
```

### ❌ Inline Styles Without Memoization

```tsx
// BAD - Creates new object on every render
<View style={{ backgroundColor: useThemeColor('background') }} />

// GOOD - Memoized
const bgColor = useThemeColor('background');
const containerStyle = useMemo(() => ({ backgroundColor: bgColor }), [bgColor]);
<View style={containerStyle} />
```

### ❌ Font Strings Scattered Everywhere

```tsx
// BAD
<Text style={{ fontSize: 14, fontFamily: 'IBMPlexMono_400Regular' }} />

// GOOD
import { textStyles } from '@/constants/typography';
<Text style={textStyles.bodySmall} />
```

### ❌ Mixing Styling Approaches

```tsx
// BAD - Mixing Tailwind and inline styles unnecessarily
<View className="flex-1" style={{ padding: 12 }} />

// GOOD - Choose one approach
<View className="flex-1 p-3" />
// OR
<View style={[styles.container, { padding: spacing.md }]} />
```

---

## Performance Tips

### 1. Memoize Style Objects

```tsx
const containerStyle = useMemo(() => ({
  backgroundColor: bgColor,
  padding: spacing.lg,
}), [bgColor]);
```

### 2. Use StyleSheet.create

```tsx
// Computed once, reused many times
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },
});
```

### 3. Avoid Inline Functions in Render

```tsx
// BAD
<Pressable onPress={() => handlePress(item.id)} />

// GOOD
const handlePress = useCallback(() => {
  handlePress(item.id);
}, [item.id]);

<Pressable onPress={handlePress} />
```

---

## Responsive Design

### Native
Use `useWindowDimensions` for responsive layouts:

```tsx
import { useWindowDimensions } from 'react-native';

function ResponsiveComponent() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  return (
    <View style={{ padding: isTablet ? spacing.xxl : spacing.lg }}>
      {/* Content */}
    </View>
  );
}
```

### Web
Use CSS media queries:

```css
.my-component {
  padding: 24px;
}

@media (max-width: 768px) {
  .my-component {
    padding: 16px;
  }
}
```

---

## Accessibility

### Focus States

**Native**:
```tsx
<Pressable
  accessible
  accessibilityLabel="Button label"
  accessibilityRole="button"
>
  {/* Content */}
</Pressable>
```

**Web**:
```css
.button:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.button:focus:not(:focus-visible) {
  outline: none;
}
```

### Color Contrast

All color combinations must meet WCAG AA standards (4.5:1 contrast ratio).

See [DESIGN_TOKENS.md](./DESIGN_TOKENS.md) for contrast ratios.

---

## Further Reading

- [DESIGN_TOKENS.md](./DESIGN_TOKENS.md) - Complete token reference
- [React Native Styling](https://reactnative.dev/docs/style)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [WCAG Color Contrast](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
