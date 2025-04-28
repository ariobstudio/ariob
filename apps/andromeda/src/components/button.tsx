import React from '@lynx-js/react';

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  className = '',
}) => {
  const baseClasses = 'flex items-center justify-center rounded-md';
  
  const variantClasses = {
    primary: 'bg-blue-500 text-white',
    secondary: 'bg-green-500 text-white',
    outline: 'border border-gray-300 text-gray-700',
  };
  
  const sizeClasses = {
    small: 'px-2 py-1 text-sm',
    medium: 'px-4 py-2',
    large: 'px-6 py-3 text-lg',
  };
  
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
  
  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`;
  
  return (
    <view 
      className={combinedClasses} 
      bindtap={disabled ? undefined : onPress}
    >
      <text>{children}</text>
    </view>
  );
};

export default Button;
