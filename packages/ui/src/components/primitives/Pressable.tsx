import { Box, BoxProps } from './Box';

/**
 * Pressable: primitive for press interactions, wraps Box and adds handlers.
 */
export interface PressableProps extends BoxProps {
  onPress?: (e?: any) => void;
}

export const Pressable: React.FC<PressableProps> = ({ onPress, children, ...rest }) => {
  return (
    <Box {...rest} bindtap={onPress}>
      {children}
    </Box>
  );
};
