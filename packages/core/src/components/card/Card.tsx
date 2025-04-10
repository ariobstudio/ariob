import { clsx } from 'clsx';
import './card.scss';

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
  const handleClick = (e: any) => {
    if (onPress) {
      onPress();
    }
  };

  const cardClasses = clsx(
    'card',
    {
      'card--elevated': variant === 'elevated',
      'card--outlined': variant === 'outlined',
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
        <view className="card__header">
            {typeof title === 'string' ? <text className="card__title">{title}</text> : title}
          </view>
      )}
      <view className="card__content">
        {children}
      </view>
    
    </view>
  );
} 