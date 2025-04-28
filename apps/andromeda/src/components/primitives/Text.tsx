import React from 'react';

/**
 * Text: primitive for rendering text, wraps `text`.
 * Supports fontSize, color, weight, align, etc.
 */
export interface TextProps extends React.ComponentProps<'text'> {
  size?: string | number;
  color?: string;
  weight?: string;
  align?: string;
  className?: string;
  [key: string]: any;
}

export const Text: React.FC<TextProps> = ({
  size,
  color,
  weight,
  align,
  className = '',
  style,
  children,
  ...rest
}) => {
  const classes = [
    size ? `text-${size}` : '',
    color ? `text-${color}` : '',
    weight ? `font-${weight}` : '',
    align ? `text-${align}` : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <text className={classes} style={style} {...rest}>
      {children}
    </text>
  );
};
