import { clsx } from 'clsx';
import { useTheme } from '../ThemeProvider';

export type CardProps = {
  children: React.ReactNode;
  title?: string | React.ReactNode;
  className?: string;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined';
  glassEffect?: boolean;
};

/**
 * Card component with customizable styles and glassy effect
 */
export function Card({
  children,
  title,
  className = '',
  onPress,
  variant = 'default',
}: CardProps) {
  const { withTheme } = useTheme();

  const handleClick = (e: any) => {
    if (onPress) {
      onPress();
    }
  };

  const cardClasses = clsx(
    withTheme(
      'card flex flex-col bg-white rounded-lg border border-gray-200 mb-4',
      'card flex flex-col bg-gray-800 rounded-lg border border-gray-700 mb-4'
    ),
    {
      'shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all': variant === 'elevated',
      [withTheme(
        'bg-transparent border border-gray-300 shadow-none',
        'bg-transparent border border-gray-600 shadow-none'
      )]: variant === 'outlined',
    },
    className
  );

  return (
    <view 
      clip-radius="true" 
      className={cardClasses}
      bindtap={onPress ? handleClick : undefined}
    >
      {title && (
        <view className={withTheme(
          "p-4 pb-2 border-b border-gray-200 font-semibold text-lg text-gray-900",
          "p-4 pb-2 border-b border-gray-700 font-semibold text-lg text-white"
        )}>
            {typeof title === 'string' ? <text>{title}</text> : title}
          </view>
      )}
      <view className={withTheme(
        "p-4 text-gray-700 flex flex-col gap-3",
        "p-4 text-gray-300 flex flex-col gap-3"
      )}>
        {children}
      </view>
    
    </view>
  );
} 