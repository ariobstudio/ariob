import React from 'react';
import { Box } from '../primitives';

export interface ListProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'bordered';
  [key: string]: any;
}

export const List: React.FC<ListProps> = ({ children, className = '', variant = 'default', ...rest }) => {
  const classes = [
    'flex flex-col',
    variant === 'bordered' ? 'border border-outline rounded-lg' : '',
    className,
  ].filter(Boolean).join(' ');
  return (
    <Box className={classes} {...rest}>
      {children}
    </Box>
  );
};
