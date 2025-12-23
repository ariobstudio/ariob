/**
 * @ariob/andromeda - Atomic Design System for React Native
 *
 * A comprehensive design system following UNIX philosophy and
 * Brad Frost's Atomic Design methodology.
 *
 * ## Structure
 * - **Themes** - Dark/Light themes with Unistyles integration
 * - **Atoms** - Indivisible building blocks (Text, Icon, Button, Input, etc.)
 * - **Molecules** - Simple atom combinations (Avatar, IconButton, InputField, Tag)
 * - **Organisms** - Complex UI sections (Card, Toast)
 * - **Layouts** - Container and arrangement utilities (Box, Row, Stack, Grid, Scroll)
 * - **Motions** - Animation utilities (Fade, Slide, Spring)
 *
 * ## Usage
 * ```tsx
 * import { Button, Text, Avatar, Card, Row, Stack, theme } from '@ariob/andromeda';
 *
 * // Initialize theme system at app start
 * import { init } from '@ariob/andromeda';
 * init();
 *
 * // Use components
 * <Card>
 *   <Stack gap="md">
 *     <Row align="center" gap="sm">
 *       <Avatar char="A" tint="accent" />
 *       <Text color="text">Username</Text>
 *     </Row>
 *     <Button variant="solid" tint="accent" onPress={handlePress}>
 *       Submit
 *     </Button>
 *   </Stack>
 * </Card>
 * ```
 */

// ─────────────────────────────────────────────────────────────────────────────
// Themes
// ─────────────────────────────────────────────────────────────────────────────

export {
  theme,
  init,
  useUnistyles,
  dark,
  light,
  type Theme,
  type Data,
  type Palette,
  type Scale,
  type Radii,
  type Font,
  type FontStyle,
  type Spring,
  type Springs,
  type Shadow,
  type Shadows,
  type Glow,
  type Degree,
  type Indicator,
} from './themes';

// Legacy tokens export (for backward compatibility during migration)
export * from './tokens';

// ─────────────────────────────────────────────────────────────────────────────
// Atoms - Indivisible building blocks
// ─────────────────────────────────────────────────────────────────────────────

export {
  Text,
  Icon,
  Press,
  Button,
  Input,
  Label,
  Badge,
  Dot,
  Line,
  Divider,
  styles as atomStyles,
  type TextProps,
  type TextSize,
  type TextColor,
  type IconProps,
  type IconSize,
  type IconColor,
  type PressProps,
  type HapticLevel,
  type ButtonProps,
  type ButtonVariant,
  type ButtonTint,
  type ButtonSize,
  type InputProps,
  type InputVariant,
  type InputSize,
  type LabelProps,
  type BadgeProps,
  type BadgeTint,
  type DotProps,
  type LineProps,
  type DividerProps,
  type DividerOrientation,
  type DividerThickness,
} from './atoms';

// ─────────────────────────────────────────────────────────────────────────────
// Molecules - Simple atom combinations
// ─────────────────────────────────────────────────────────────────────────────

export {
  Avatar,
  IconButton,
  InputField,
  Tag,
  Dropdown,
  styles as moleculeStyles,
  type AvatarProps,
  type AvatarSize,
  type AvatarTint,
  type IconButtonProps,
  type IconButtonSize,
  type IconButtonTint,
  type InputFieldProps,
  type TagProps,
  type TagTint,
  type DropdownProps,
  type DropdownOption,
} from './molecules';

// ─────────────────────────────────────────────────────────────────────────────
// Organisms - Complex UI sections
// ─────────────────────────────────────────────────────────────────────────────

export {
  Card,
  Toast,
  ToastItem,
  ToastContainer,
  ToastProvider,
  useToasts,
  toast,
  styles as organismStyles,
  type CardProps,
  type CardVariant,
  type ToastVariant,
  type ToastAction,
  type ToastConfig,
  type ToastOptions,
  type ToastProps,
  type ToastContainerProps,
  type ToastProviderProps,
  type ToastAPI,
} from './organisms';

// ─────────────────────────────────────────────────────────────────────────────
// Layouts - Container and arrangement utilities
// ─────────────────────────────────────────────────────────────────────────────

export {
  Box,
  type BoxProps,
  type BoxVariant,
  type BoxPadding,
  Row,
  type RowProps,
  type GapSize,
  type Alignment,
  type Justification,
  Stack,
  type StackProps,
  Grid,
  type GridProps,
  Scroll,
  type ScrollProps,
} from './layouts';

// ─────────────────────────────────────────────────────────────────────────────
// Motions - Animation utilities
// ─────────────────────────────────────────────────────────────────────────────

export * from './motions';

// ─────────────────────────────────────────────────────────────────────────────
// Nodes - Social OS node renderers
// ─────────────────────────────────────────────────────────────────────────────

export {
  ProfileCard,
  AICard,
  NodeRenderer,
  type ProfileCardProps,
  type AICardProps,
  type NodeRendererProps,
} from './nodes';
