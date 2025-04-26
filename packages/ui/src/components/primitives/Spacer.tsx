import { Box } from './Box';

/**
 * Spacer: primitive for spacing, renders an empty Box with width or height.
 */
export interface SpacerProps {
  size?: number | string; // px or token key
  direction?: 'vertical' | 'horizontal';
  className?: string;
}

export const Spacer: React.FC<SpacerProps> = ({
  size = 8,
  direction = 'vertical',
  className = '',
}) => {
  const style =
    direction === 'vertical'
      ? { height: typeof size === 'number' ? `${size}px` : size }
      : { width: typeof size === 'number' ? `${size}px` : size };
  return <Box style={style} className={className} />;
};
