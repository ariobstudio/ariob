import React from 'react';
import { Box, BoxProps } from './Box';

/**
 * Flex: layout primitive for flexbox layouts.
 * Wraps Box and sets display to flex, supports direction, align, justify, gap, etc.
 */
export interface FlexProps extends BoxProps {
  direction?: 'row' | 'column';
  align?: string;
  justify?: string;
  gap?: string | number;
}

export const Flex: React.FC<FlexProps> = ({
  direction = 'row',
  align,
  justify,
  gap,
  className = '',
  style,
  children,
  ...rest
}) => {
  const flexClasses = [
    'flex',
    direction === 'column' ? 'flex-col' : 'flex-row',
    align ? `items-${align}` : '',
    justify ? `justify-${justify}` : '',
    gap !== undefined ? (typeof gap === 'number' ? `gap-${gap}` : gap) : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Box className={flexClasses} style={style} {...rest}>
      {children}
    </Box>
  );
};
