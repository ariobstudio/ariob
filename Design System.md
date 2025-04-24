Below is a **framework-agnostic, theme-ready component catalogue** and the **file / token structure** that lets any Ariob developer mix-and-match pieces, reskin them with new tokens, or swap underlying tech (Tailwind, plain CSS Vars, React-Native, etc.) without rewriting UI logic.

---

## 1  Layered Design Architecture

```
design-tokens/        ← color, spacing, radius, motion, etc. (JSON / CSS Vars)
│
ui-primitives/        ← raw building blocks (Box, Flex, Text…)
│
ui-components/        ← styled widgets (Button, Input, Card…)
│
ui-composites/        ← bigger patterns (Navbar, Modal, DataTable…)
│
apps/                 ← CodeCollab, Q&A, Kanban… import from ui-components
```

* **Design-tokens** are the single source of truth (SSOT).  
* **Primitives** read tokens directly; **components** only use primitives; **apps** only use components.  
* Swap Tailwind ⇄ CSS Vars ⇄ React-Native styles by supplying a new *token adapter*—the higher layers stay unchanged.

---

## 2  Token Set (via JSON + CSS Variables)

```jsonc
{
  "colors": {
    "primary":   "#3B82F6",
    "secondary": "#6B7280",
    "success":   "#10B981",
    "warning":   "#F59E0B",
    "error":     "#EF4444",
    "surface":   "#FFFFFF",
    "surface-alt":"#F9FAFB",
    "text-strong":"#111827",
    "text":      "#374151",
    "text-soft": "#6B7280"
  },
  "space": { "0":0, "1":4, "2":8, "3":12, "4":16, "5":20, "6":24 },
  "radii": { "sm":4, "md":8, "lg":12, "full":9999 },
  "fontSizes": { "xs":12, "sm":14, "md":16, "lg":20, "xl":24, "2xl":30 },
  "shadows": { "sm":"0 1px 2px rgba(0,0,0,.05)", "md":"0 4px 6px rgba(0,0,0,.06)" },
  "motion":  { "fast":"150ms", "normal":"300ms", "slow":"500ms" }
}
```

At build time a small script:

* emits `:root { --color-primary:#3B82F6; … }`  
* injects Tailwind config (`theme.extend.colors.primary = 'var(--color-primary)'`)  
* or generates React-Native `StyleSheet` objects.

---

## 3  UI Primitive Catalog (“lego bricks”)

| Primitive | Purpose | Key Props |
|-----------|---------|-----------|
| **Box**   | generic `<div>` / `<View>` | `as` (element override), `bg`, `p`, `m`, `shadow`, `border` |
| **Flex**  | flex container            | `direction`, `align`, `justify`, `gap`, `wrap` |
| **Grid**  | CSS Grid / RN Grid        | `cols`, `rows`, `gap` |
| **Stack** | vertical/horizontal stack | auto gaps without extra wrappers |
| **Text**  | typography wrapper        | `size`, `weight`, `color`, `truncate` |
| **Heading** | semantic titles        | `level={1‒6}` maps to token font sizes |
| **Spacer** | fixed or fluid gap        | `size` |
| **Divider**| horizontal / vertical line| `thickness`, `color` |
| **Icon**   | SVG / glyph renderer     | `name`, `size`, `color` |

All primitives accept **utility-style shorthand props** (`bg="primary"`, `p={3}`, `rounded="md"`) that internally resolve to tokens, so they remain framework agnostic.

---

## 4  Component Library (atomic widgets)

### Inputs & Controls
* **Button** – `variant: solid | outline | ghost | link`, `size: sm|md|lg`, `colorScheme`
* **IconButton** – square version of Button
* **TextField** – single-line; `prefix`, `suffix`, `state: default|error|success`
* **TextArea** – multi-line, auto-resize
* **Select** – custom dropdown; `multiple`
* **Checkbox** – controlled & indeterminate
* **Radio** – grouped selection
* **Switch** – toggles with animation
* **Slider / Range** – numeric input
* **FileUpload** – drag-and-drop + previews

### Data Display
* **Avatar** – initials fallback, status badge
* **Badge / Tag** – pill element; `colorScheme`
* **Card** – surface container; `variant: flat|elevated|outlined`
* **List** & **ListItem**
* **Table** – responsive, sortable headers, zebra rows
* **ProgressBar** – linear or circular
* **Statistic** – value + label, up/down trend
* **Timeline** – vertical feed of events
* **Skeleton** – loading shimmer

### Feedback / Overlay
* **Alert** – inline messages; `type: info|success|warning|error`
* **Toast** – transient top/bottom snack
* **Tooltip** – hover / long-press info
* **Popover** – small contextual surface
* **Modal** – centered dialog, `size`, `scrollable`
* **Drawer / Sheet** – slide-in panel
* **Spinner** – indeterminate loading

### Navigation
* **Navbar** – top app bar; slots: `left`, `center`, `right`
* **Sidebar** – collapsible nav w/ groups
* **TabBar / SegmentedControl**
* **Breadcrumb**
* **Pagination**
* **Stepper** – multi-step indicator

### Layout Helpers
* **Container** – responsive max-width
* **Section** – page stripe with themable background
* **Paper** – bare card without padding
* **GridList** – masonry / auto-fit grid

---

## 5  Composites / Patterns

| Composite | Built from | Typical Use |
|-----------|-----------|-------------|
| **AuthForm**              | Card + TextField + Button        | Sign-in / Sign-up |
| **CommentThread**         | Avatar + Text + Button           | Microblog replies, Q&A comments |
| **KanbanColumn**          | Card (list) + DragHandle         | Project board |
| **CodeEditorPane**        | Card + Tabs + TextArea           | CodeCollab |
| **FeedItem**              | Card + Avatar + Text + Badge     | Social timeline |
| **NotificationCenter**    | Drawer + List + Icon             | cross-app alerts |

Composites live in `ui-composites/` and should **only** depend on primitives + atomic components; they are still themeable because all sub-parts inherit tokens.

---

## 6  Variant & Theming Mechanism

*Every component exposes the same prop surface:*

```ts
type VariantProps = {
  size?: 'xs'|'sm'|'md'|'lg';
  colorScheme?: TokenColorKeys;   // 'primary' | 'secondary' | ...
  variant?: string;               // component-specific list
  radius?: TokenRadiusKeys;
  shadow?: TokenShadowKeys;
  className?: string;             // pass-through for low-level tweaks
}
```

Implementation pattern:

1. **Token lookup** – derive CSS vars, e.g.  
   `--btn-bg: var(--color-primary); --btn-radius: var(--radii-md);`
2. **Utility merge** – if Tailwind present, emit `bg-[var(--btn-bg)] rounded-[var(--btn-radius)]`.
3. **Slot injection** – components expose logical slots (`<Button.Icon>`, `<Card.Header>`) for composition; tokens cascade.

Themes = *token overrides*.  
A dark theme simply overrides `--color-surface` and `--color-text`; the button auto flips.

Developers can:

* **extend** – `export const DangerButton = (p) => <Button colorScheme="error" {...p}/>`  
* **override** – supply `<ThemeProvider tokens={{ colors: { primary:'#8B5CF6' }}}>…</ThemeProvider>`  
* **compose** – wrap primitives to craft brand-specific widgets without touching core.

---

## 7  Directory / Package Layout

```
packages/
├─ tokens/                  # raw JSON + build scripts
│   ├─ light.json
│   ├─ dark.json
│   └─ build-css-vars.js    # emits tokens.css + tailwind.config.cjs
├─ ui-primitives/
│   └─ Box.tsx … Flex.tsx
├─ ui-components/
│   ├─ inputs/
│   │   ├─ Button.tsx
│   │   └─ TextField.tsx
│   ├─ data-display/
│   │   ├─ Avatar.tsx
│   │   └─ Card.tsx
│   └─ feedback/
│       ├─ Modal.tsx
│       └─ Toast.tsx
├─ ui-composites/
│   ├─ AuthForm.tsx
│   ├─ FeedItem.tsx
│   └─ KanbanColumn.tsx
├─ tailwind-plugin/         # optional: inject tokens into TW
│   └─ index.js
└─ docs-site/               # Storybook / Ladle w/ MDX docs + playground
```

*Each folder is **framework-agnostic**—swap React for Solid or Svelte by re-implementing primitives with the same props contract; components keep compiling.*

---

## 8  Usage Workflow

1. **Install core packages**

```bash
pnpm add @ariob/tokens @ariob/ui-components
# or yarn / npm
```

2. **Choose renderer**

```ts
import { Button, Card } from '@ariob/ui-components';
```

3. **Theme or extend**

```ts
import { ThemeProvider } from '@ariob/ui-primitives';

<ThemeProvider tokens={{ colors:{ primary:'#A855F7' } }}>
  <Button>My Violet Button</Button>
</ThemeProvider>
```

4. **Ship the app → bundle**  
Ariob CLI strips unused CSS, treeshakes icons, and publishes the mini-app with only the components actually referenced.

---

### Why this matters for Ariob

* **Agnostic:** nothing is tied to Tailwind; Tailwind is just one renderer.  
* **Customizable:** every visual constant is a token, overridable at runtime or build-time.  
* **Composable:** primitives → atomic widgets → composites → apps keep responsibility boundaries clean.  
* **Lightweight:** tree-shaked per-app bundles avoid duplicating shared primitives.  
* **Cross-platform:** the same token JSON drives CSS Vars on web and StyleSheet values in Lynx mobile.

With this catalogue and structure in place, any Ariob developer can spin up a new mini-app, drop in a Button, swap the primary palette to match their brand, or invent a brand-new composite (e.g., *“GraphQL Explorer Panel”*) that still looks and feels native inside the broader Ariob ecosystem—while keeping UI code decoupled from transport (GunDB), runtime (LynxJS), or styling engine.