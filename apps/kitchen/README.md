# Kitchen Sink - Component Showcase

A comprehensive showcase application for all UI components in the `@ariob/ui` package. This app demonstrates every component with various configurations, variants, and sizes.

## What's Inside

The Kitchen Sink app showcases:

### Form Components
- **Buttons**: All variants (default, destructive, outline, secondary, ghost, link) and sizes (sm, default, lg, icon)
- **Input**: Text, email, password, and number inputs
- **TextArea**: Multi-line text input with configurable rows
- **Label**: Form labels with required field indicators
- **SearchInput**: Search field with clear button and loading states

### Layout Components
- **Card**: Card container with header, title, description, content, and footer sections
- **Separator**: Horizontal and vertical dividers
- **Tabs**: Tabbed navigation with scrollable variant

### Feedback Components
- **Alert**: Information and error alerts with title and description
- **Badge**: Status badges in multiple variants and sizes, including dot indicators
- **Spinner**: Loading spinners in various sizes

### Data Display
- **Avatar**: User avatars with initials, images, and online status
- **Icon**: Lucide icon library integration
- **EmptyState**: Placeholder for empty data states

## Features

### Responsive Design
- Uses `SystemInfo` API to detect screen dimensions
- Adapts layout for mobile and desktop views
- Displays platform and screen information

### Theme Support
- Integrates with `useTheme` hook from `@ariob/ui`
- Supports light and dark modes
- Theme-aware component styling

### Organized Navigation
- Tab-based navigation for easy component browsing
- Categories: Buttons, Inputs, Cards, Feedback, Data Display
- Scrollable content with proper spacing

## Running the App

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

Scan the QRCode in the terminal with your LynxExplorer App to see the result.

## Usage as Reference

This app serves as:
1. **Component Library Documentation**: See all components in action
2. **Design System Reference**: Visual guide for consistent UI patterns
3. **Implementation Examples**: Copy-paste ready component usage
4. **Testing Ground**: Experiment with component configurations

## Component Examples

### Button with Icon
```tsx
<Button>
  <Icon name="mail" />
  <text>With Icon</text>
</Button>
```

### Form Field with Label
```tsx
<view className="flex flex-col gap-2">
  <Label required>Password</Label>
  <Input type="password" placeholder="Enter password" />
</view>
```

### Card with Actions
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    <text>Content goes here</text>
  </CardContent>
  <CardFooter>
    <Button variant="outline">Cancel</Button>
    <Button>Confirm</Button>
  </CardFooter>
</Card>
```

### Responsive Layout
```tsx
// Get screen dimensions
const screenWidth = SystemInfo.pixelWidth / SystemInfo.pixelRatio;
const isSmallScreen = screenWidth < 640;

// Use in component
<text>
  {isSmallScreen ? 'Mobile' : 'Desktop'} View
</text>
```

## Styling Standards

All components follow shadcn/ui design principles adapted for Lynx:

- **Consistent Spacing**: Uses Tailwind spacing scale (gap-2, p-4, etc.)
- **Rounded Corners**: Standard border-radius values (rounded-md, rounded-lg)
- **Shadow Depths**: Subtle shadows (shadow-xs, shadow-sm)
- **Color System**: Theme-aware colors via CSS variables
- **Typography**: Hierarchical text sizing (text-sm, text-base, text-lg)

## Adding New Components

When adding components to `@ariob/ui`:

1. **Update the component** with shadcn-inspired styling
2. **Export from** `packages/ui/src/components/ui/index.ts`
3. **Add to Kitchen Sink** in the appropriate tab
4. **Document usage** with examples

## Platform Support

- ✅ iOS
- ✅ Android
- ✅ Web
- ✅ macOS
- ✅ HarmonyOS (future)

## Technologies

- **LynxJS**: Cross-platform UI framework
- **@ariob/ui**: Component library
- **Tailwind CSS**: Utility-first styling
- **class-variance-authority**: Component variants
- **TypeScript**: Type safety

## Related

- [`@ariob/ui`](../../packages/ui/) - UI component library
- [`@ariob/core`](../../packages/core/) - Core utilities and state management
- [Template](../../template/) - Base template for new apps
