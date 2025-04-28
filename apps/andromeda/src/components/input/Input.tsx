import clsx from 'clsx';
import { useTheme } from '../ThemeProvider';

export interface InputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  variant?: 'underline' | 'outlined';
  size?: 'md' | 'lg';
  error?: string;
}

export function Input({
  label,
  placeholder,
  value,
  onChange,
  className = '',
  variant = 'underline',
  size = 'md',
  error,
}: InputProps) {
  const { withTheme } = useTheme();
  
  const handleInput = (input: any) => {
    if (onChange) {
      onChange(input.detail.value);
    }
  };

  const variantClass = variant === 'underline' 
    ? withTheme('border-b border-gray-300', 'border-b border-gray-600')
    : withTheme('border border-gray-300 rounded-md px-3', 'border border-gray-600 rounded-md px-3');
  
  const sizeClass = size === 'md' ? 'h-12 py-3' : 'h-14 py-6 text-lg';
  
  const errorClass = error ? withTheme('border-red-500', 'border-red-400') : '';
  
  const inputClass = withTheme(
    `${sizeClass} ${variantClass} ${errorClass} bg-white text-gray-900`,
    `${sizeClass} ${variantClass} ${errorClass} bg-gray-800 text-white`
  );

  const labelClass = clsx(
    withTheme(
      'text-gray-700 mb-2',
      'text-gray-300 mb-2'
    ),
    {
      'text-sm': size === 'md',
      'text-base': size === 'lg',
    }
  );

  return (
    <view className={`input-container ${className}`}>
      {label && <text className={labelClass}>{label}</text>}
      <input
        className={inputClass}
        value={value}
        // @ts-ignore
        bindinput={handleInput}
        placeholder={placeholder}
        text-color={withTheme('000000', 'FFFFFF')}
        placeholder-color={withTheme('000000', 'FFFFFF')}
        style={{ 
          fontSize: size === 'lg' ? '18px' : '16px',
        }}
      />
      {error && (
        <text className={withTheme(
          "text-sm mt-1 text-red-500",
          "text-sm mt-1 text-red-400"
        )}>{error}</text>
      )}
    </view>
  );
}
