// Ripple-specific primitives (with domain variants)
export * from './line';
export * from './dot';
export * from './badge';
export * from './avatar';
export * from './shell';

// Re-export Andromeda atoms for convenience
// These are generic design system components
export {
  Text,
  Icon,
  Press,
  Button,
  Input,
  Label,
  Divider,
  type TextProps,
  type IconProps,
  type PressProps,
  type ButtonProps,
  type InputProps,
  type LabelProps,
  type DividerProps,
} from '@ariob/andromeda';

// Re-export Andromeda layout for convenience
export {
  Box,
  Row,
  Stack,
  Grid,
  Scroll,
  type BoxProps,
  type RowProps,
  type StackProps,
  type GridProps,
  type ScrollProps,
} from '@ariob/andromeda';
