# UI Components

This directory contains reusable UI components for the Andromeda application, built on Lynx elements for cross-platform compatibility.

## Architecture

All components follow standardized patterns defined in [ui-components.mdc](mdc:.roo/rules/ui-components.mdc):

- **Lynx Elements**: Built using `<view>`, `<text>`, and native input elements
- **Variants**: Managed with class-variance-authority (cva) for consistent styling
- **Theming**: Integrated with design tokens and light/dark mode support
- **Accessibility**: ARIA attributes, focus states, and keyboard navigation
- **Data Attributes**: `data-slot` for component identification and testing

## Components

### Button (`button.tsx`)
Multi-variant button component with icon support.
```tsx
<Button variant="default" size="lg" icon="user">
  Click me
</Button>
```

**Variants**: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`  
**Sizes**: `sm`, `default`, `lg`, `icon`

### Input (`input.tsx`)
Form input with theme integration and validation states.
```tsx
<Input type="email" placeholder="Enter email" aria-invalid={hasError} />
```

### Card (`card.tsx`)
Compound component for content containers.
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
    <CardAction>Action</CardAction>
  </CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter>Footer</CardFooter>
</Card>
```

### Icon (`icon.tsx`)
Lucide icon renderer with size variants.
```tsx
<Icon name="user" size="lg" />
```

### Alert (`alert.tsx`)
Alert/notification component with variant styling.

### Textarea (`textarea.tsx`)
Multi-line text input component.

## Development Guidelines

### Adding New Components

1. **Follow the structure pattern** from [ui-components.mdc](mdc:.roo/rules/ui-components.mdc)
2. **Use Lynx elements** (`<view>`, `<text>`) - see [lynx-elements.mdc](mdc:.roo/rules/lynx-elements.mdc)
3. **Include cva variants** for multiple visual states
4. **Add data-slot attributes** for component identification
5. **Support theme integration** with `useTheme` hook when needed
6. **Export component and variants** for external usage

### Component Template

```tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const componentVariants = cva(
  "base-classes focus-visible:border-ring focus-visible:ring-ring/50",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        // ... other variants
      },
      size: {
        default: 'h-9 px-4',
        // ... other sizes
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

interface ComponentProps
  extends React.ComponentProps<'view'>,
    VariantProps<typeof componentVariants> {
  // additional props
}

function Component({ className, variant, size, ...props }: ComponentProps) {
  return (
    <view
      data-slot="component-name"
      className={cn(componentVariants({ variant, size, className }))}
      {...props}
    >
      {props.children}
    </view>
  );
}

export { Component, componentVariants };
```

### Testing Components

Use `data-slot` attributes for reliable component selection:
```tsx
// In tests
screen.getByTestId('[data-slot="button"]')
```

## Design System Integration

Components reference the design system through:
- **Color tokens**: `text-primary-foreground`, `bg-card`, `border-border`
- **Shadow utilities**: `shadow-xs` for consistent elevation
- **Size scales**: Consistent `sm`, `default`, `lg` sizing
- **Focus states**: `focus-visible:ring-ring/50` for accessibility

## Cross-Platform Compatibility

All components use Lynx elements ensuring native rendering on:
- **Web**: Renders as standard HTML with CSS
- **iOS**: Native UIKit components  
- **Android**: Native Android View components

For platform-specific styling, use the `useTheme` hook with `withTheme()` utility.
