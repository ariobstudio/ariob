/**
 * Unified Icon component using @expo/vector-icons (FontAwesome6)
 * Works on both web and native platforms
 */
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import type { IconVariant, IconSize } from './types';
import { iconSizes } from './types';

export interface IconProps {
  /** FontAwesome 6 icon name */
  name: string;
  /** Icon variant: solid (default), regular, or brands */
  variant?: IconVariant;
  /** Icon size */
  size?: IconSize | number;
  /** Icon color */
  color?: string;
  /** Additional styles */
  style?: any;
}

export function Icon({ name, variant = 'solid', size = 'md', color = 'currentColor', style }: IconProps) {
  const iconSize = typeof size === 'number' ? size : iconSizes[size];
  
  return (
    <FontAwesome6
      name={name}
      size={iconSize}
      color={color}
      style={style}
      solid={variant === 'solid'}
      regular={variant === 'regular'}
      brand={variant === 'brands'}
    />
  );
}
