import React, { useState } from 'react';
import clsx from 'clsx';
import { useTheme } from '../ThemeProvider';
import { Box, Flex, Text, Pressable } from '../primitives';

export type ButtonProps = {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outlined' | 'text';
  onPress?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
};

/**
 * Button component that follows our design system
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  onPress,
  className = '',
  icon,
  disabled = false,
  loading = false,
  fullWidth = false
}: ButtonProps) {
  const { withTheme } = useTheme();
  const [isPressed, setIsPressed] = useState(false);
  
  // Variant classes
  const variantClasses = {
    primary: withTheme(
      'bg-blue-600 text-white', 
      'bg-blue-500 text-white'
    ),
    secondary: withTheme(
      'bg-gray-600 text-white', 
      'bg-gray-500 text-white'
    ),
    outlined: withTheme(
      'bg-transparent border border-blue-600 text-blue-600', 
      'bg-transparent border border-blue-500 text-blue-500'
    ),
    text: withTheme(
      'bg-transparent text-blue-600 px-2', 
      'bg-transparent text-blue-500 px-2'
    )
  }[variant];
  
  // Size classes
  const sizeClasses = {
    sm: 'py-2 px-3 text-sm min-h-8',
    md: 'py-3 px-4 text-base min-h-10',
    lg: 'py-4 px-5 text-lg min-h-12'
  }[size];
  
  // State classes
  const stateClasses = clsx({
    'opacity-60': disabled || loading,
    'scale-98': isPressed,
    'w-full': fullWidth,
  });
  
  const buttonClass = clsx(
    'rounded-lg font-medium transition-all duration-200',
    variantClasses,
    sizeClasses,
    stateClasses,
    className
  );

  const handleTouchStart = () => {
    if (!disabled && !loading) {
      setIsPressed(true);
    }
  };

  const handleTouchEnd = () => {
    setIsPressed(false);
  };

  const handleTap = (e: any) => {
    if (!disabled && !loading && onPress) {
      onPress();
    }
  };
  
  // Spinner styles based on current theme
  const spinnerClass = clsx(
    'w-4 h-4 border-2 border-transparent rounded-full animate-spin',
    {
      'border-t-white': variant === 'primary',
      [withTheme('border-t-blue-600', 'border-t-blue-500')]: variant !== 'primary',
    }
  );

  return (
    <Pressable
      className={buttonClass}
      style={{
        width: fullWidth ? '100%' : 'auto',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        transform: isPressed ? 'scale(0.98)' : 'scale(1)',
      }}
      onPress={onPress}
      onTouchStart={handleTouchStart}
      onTouchEnd={() => setIsPressed(false)}
      onTouchCancel={() => setIsPressed(false)}
      disabled={disabled || loading}
    >
      <Flex align="center" justify="center">
        {loading && (
          <Box className="mr-2 flex items-center justify-center">
            <Box className={spinnerClass} />
          </Box>
        )}
        {icon && !loading && (
          <Box className="mr-2">{icon}</Box>
        )}
        {typeof children === 'string' ? (
          <Text>{children}</Text>
        ) : children}
      </Flex>
    </Pressable>
  );
}