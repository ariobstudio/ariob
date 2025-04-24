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
   
  // Define light and dark mode classes for card
  const comp__light = 'bg-white border border-border text-foreground';
  const comp__dark = 'bg-gray-800 border border-border text-foreground';

  const cardClasses = clsx(
    'rounded-xl shadow-md border border-outline flex flex-col',
    withTheme(comp__light, comp__dark),
    {
      'shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all': variant === 'elevated',
      [withTheme(
        'bg-transparent border border-border shadow-none',
        'bg-transparent border border-border shadow-none'
      )]: variant === 'outlined',
    },
    className
  );

  const titleClasses = withTheme(
    'p-4 pb-2 border-b border-border font-semibold text-lg text-foreground',
    'p-4 pb-2 border-b border-border font-semibold text-lg text-foreground'
  );

  const sectionClasses = withTheme(
    'p-4 text-foreground flex flex-col gap-3',
    'p-4 text-foreground flex flex-col gap-3'
  );

  return (
    <view 
      clip-radius="true" 
      className={cardClasses}
      bindtap={onPress ? handleClick : undefined}
    >
      {title && (
        <view className={titleClasses}>
            {typeof title === 'string' ? <text>{title}</text> : title}
          </view>
      )}
      <view className={sectionClasses}>
        {children}
      </view>
    </view>
  );
} 