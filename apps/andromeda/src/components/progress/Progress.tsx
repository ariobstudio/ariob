import React from 'react';
import { Box } from '../primitives';

export interface ProgressProps {
  value: number;
  max?: number;
  colorScheme?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
  className?: string;
}

const colorMap = {
  primary: 'bg-blue-600',
  secondary: 'bg-gray-600',
  success: 'bg-green-600',
  danger: 'bg-red-600',
  warning: 'bg-yellow-400',
};

export const Progress: React.FC<ProgressProps> = ({ value, max = 100, colorScheme = 'primary', className = '' }) => {
  const percent = Math.min(100, (value / max) * 100);
  return (
    <Box className={`w-full h-2 rounded-full bg-gray-200 overflow-hidden ${className}`}>
      <Box className={`h-full transition-all duration-200 ${colorMap[colorScheme]}`} style={{ width: `${percent}%` }} />
    </Box>
  );
};
