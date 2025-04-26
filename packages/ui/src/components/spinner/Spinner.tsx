import React from 'react';
import { Box } from '../primitives';

export interface SpinnerProps {
  size?: number;
  color?: string;
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 24, color = '#3B82F6', className = '' }) => {
  // Use inline style for border color if not using Tailwind color tokens
  const borderColor = color.startsWith('#') ? color : undefined;
  const colorClass = !borderColor ? `border-${color}-500` : '';

  return (
    <Box
      className={`animate-spin rounded-full border-2 border-solid border-current border-t-transparent ${colorClass} ${className}`}
      style={{ width: size, height: size, borderColor: borderColor || undefined }}
    />
  );
};
