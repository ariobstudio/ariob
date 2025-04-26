import React from 'react';
import { Box, Text } from '../primitives';

export interface ChipProps {
  children: React.ReactNode;
  colorScheme?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
  className?: string;
}

const colorMap = {
  primary: 'bg-blue-100 text-blue-800',
  secondary: 'bg-gray-100 text-gray-800',
  success: 'bg-green-100 text-green-800',
  danger: 'bg-red-100 text-red-800',
  warning: 'bg-yellow-100 text-yellow-800',
};

export const Chip: React.FC<ChipProps> = ({ children, colorScheme = 'primary', className = '' }) => {
  return (
    <Box className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colorMap[colorScheme]} ${className}`}>
      <Text>{children}</Text>
    </Box>
  );
};
