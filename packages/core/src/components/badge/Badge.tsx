import React from 'react';
import { Box, Text } from '../primitives';

export interface BadgeProps {
  children: React.ReactNode;
  colorScheme?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
  className?: string;
}

const colorMap = {
  primary: 'bg-blue-600 text-white',
  secondary: 'bg-gray-600 text-white',
  success: 'bg-green-600 text-white',
  danger: 'bg-red-600 text-white',
  warning: 'bg-yellow-400 text-black',
};

export const Badge: React.FC<BadgeProps> = ({ children, colorScheme = 'primary', className = '' }) => {
  return (
    <Box className={`flex items-center px-2 py-1 rounded-full text-xs font-semibold ${colorMap[colorScheme]} ${className}`}>
      <Text>{children}</Text>
    </Box>
  );
};
