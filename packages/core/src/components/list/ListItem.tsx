import React from 'react';
import { Box, Text } from '../primitives';

export interface ListItemProps {
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  [key: string]: any;
}

export const ListItem: React.FC<ListItemProps> = ({ children, className = '', icon, ...rest }) => {
  return (
    <Box className={`flex items-center gap-3 px-4 py-2 border-b border-outline last:border-0 ${className}`} {...rest}>
      {icon && <Box className="w-6 h-6 flex items-center justify-center">{icon}</Box>}
      <Text>{children}</Text>
    </Box>
  );
};
