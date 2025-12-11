import { type VariantProps, cva } from 'class-variance-authority';
import type { StandardProps } from '@lynx-js/types';
import * as React from '@lynx-js/react';
import { cn } from '../../lib/utils';
import type { LynxReactNode } from '../../types/react';

const listItemVariants = cva(
  'flex items-center transition-all duration-200 outline-none',
  {
    variants: {
      variant: {
        default: '',
        ghost: '',
        bordered: 'border-b border-border last:border-b-0',
        card: 'bg-card border border-border rounded-lg shadow-sm',
        none: '',
      },
      size: {
        sm: 'px-3 py-2 gap-2',
        md: 'px-4 py-3 gap-3',
        lg: 'px-6 py-4 gap-4',
      },
      state: {
        default: '',
        selected: 'bg-primary/10 border-primary/20',
        disabled: 'opacity-50 pointer-events-none',
        active: 'bg-accent',
      },
      align: {
        start: 'justify-start',
        center: 'justify-center',
        end: 'justify-end',
        between: 'justify-between',
      },
      direction: {
        row: 'flex-row',
        column: 'flex-col items-start',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      state: 'default',
      align: 'start',
      direction: 'row',
    },
  },
);

interface ListItemProps
  extends Omit<StandardProps, 'children'>,
    VariantProps<typeof listItemVariants> {
  /**
   * Unique key for list item (required when used in <list>)
   */
  itemKey?: string;
  /**
   * Allow node recycling for performance
   * @default true
   */
  recyclable?: boolean;
  /**
   * Reuse identifier for grouping similar items
   */
  reuseIdentifier?: string;
  /**
   * Estimated size for placeholder before render
   */
  estimatedSize?: number;
  /**
   * Sticky at top
   */
  stickyTop?: boolean;
  /**
   * Sticky at bottom
   */
  stickyBottom?: boolean;
  /**
   * Occupy full row/column in multi-column layouts
   */
  fullSpan?: boolean;
  /**
   * Press handler
   */
  onPress?: () => void;
  /**
   * Whether item is selected
   */
  selected?: boolean;
  /**
   * Whether item is disabled
   */
  disabled?: boolean;
  /**
   * Left element (icon, avatar, etc.)
   */
  leftElement?: LynxReactNode;
  /**
   * Right element (chevron, badge, etc.)
   */
  rightElement?: LynxReactNode;
  /**
   * Title text
   */
  title?: string;
  /**
   * Subtitle text
   */
  subtitle?: string;
  /**
   * Description text
   */
  description?: string;
  /**
   * Children content
   */
  children?: LynxReactNode;
}

/**
 * ListItem - High-performance list item using native list-item element
 *
 * Should be used as direct child of <list> for proper virtualization and recycling
 *
 * @see https://lynxjs.org/api/elements/built-in/list
 *
 * @example
 * ```tsx
 * <ListItem
 *   itemKey="item-1"
 *   title="Item Title"
 *   subtitle="Item subtitle"
 *   leftElement={<Icon name="check" />}
 *   rightElement={<Icon name="chevron-right" />}
 *   onPress={() => console.log('pressed')}
 * />
 * ```
 */
function ListItem({
  className,
  itemKey,
  recyclable = true,
  reuseIdentifier,
  estimatedSize,
  stickyTop,
  stickyBottom,
  fullSpan,
  variant,
  size,
  state,
  align,
  direction,
  onPress,
  selected,
  disabled,
  leftElement,
  rightElement,
  title,
  subtitle,
  description,
  children,
  ...props
}: ListItemProps) {
  // Generate fallback key if not provided (item-key is required by Lynx)
  const finalItemKey = React.useMemo(() => {
    return itemKey || `list-item-${Math.random().toString(36).substr(2, 9)}`;
  }, [itemKey]);

  // Determine the state based on props
  const itemState = React.useMemo(() => {
    if (disabled) return 'disabled';
    if (selected) return 'selected';
    return state;
  }, [disabled, selected, state]);

  const handlePress = React.useCallback(() => {
    if (!disabled && onPress) {
      onPress();
    }
  }, [disabled, onPress]);

  const [isPressed, setIsPressed] = React.useState(false);

  const handleTouchStart = () => {
    'main thread';
    if (!disabled) {
      setIsPressed(true);
    }
  };

  const handleTouchEnd = () => {
    'main thread';
    setIsPressed(false);
  };

  // If title/subtitle provided, render structured content
  if (title || subtitle || description) {
    return (
      <list-item
        item-key={finalItemKey}
        recyclable={recyclable}
        reuse-identifier={reuseIdentifier}
        estimated-main-axis-size-px={estimatedSize}
        sticky-top={stickyTop}
        sticky-bottom={stickyBottom}
        full-span={fullSpan}
        data-slot="list-item"
        className={cn(
          listItemVariants({
            variant,
            size,
            state: itemState,
            align,
            direction,
          }),
          isPressed && !disabled && 'bg-accent/70',
          className
        )}
        bindtap={handlePress}
        bindtouchstart={handleTouchStart}
        bindtouchend={handleTouchEnd}
        {...props}
      >
        {leftElement && (
          <view data-slot="list-item-left" className="shrink-0">
            {leftElement}
          </view>
        )}

        <view
          data-slot="list-item-content"
          className={cn(
            'flex-1 min-w-0',
            direction === 'column'
              ? 'flex flex-col gap-1'
              : 'flex flex-col gap-0.5',
          )}
        >
          {title && (
            <text
              data-slot="list-item-title"
              className="font-medium text-foreground truncate"
            >
              {title}
            </text>
          )}
          {subtitle && (
            <text
              data-slot="list-item-subtitle"
              className="text-sm text-muted-foreground truncate"
            >
              {subtitle}
            </text>
          )}
          {description && (
            <text
              data-slot="list-item-description"
              className="text-xs text-muted-foreground line-clamp-2"
            >
              {description}
            </text>
          )}
          {children}
        </view>

        {rightElement && (
          <view data-slot="list-item-right" className="shrink-0">
            {rightElement}
          </view>
        )}
      </list-item>
    );
  }

  // If no structured content, render children directly
  return (
    <list-item
      item-key={finalItemKey}
      recyclable={recyclable}
      reuse-identifier={reuseIdentifier}
      estimated-main-axis-size-px={estimatedSize}
      sticky-top={stickyTop}
      sticky-bottom={stickyBottom}
      full-span={fullSpan}
      data-slot="list-item"
      className={cn(
        listItemVariants({
          variant,
          size,
          state: itemState,
          align,
          direction,
        }),
        isPressed && !disabled && 'bg-accent/70',
        className
      )}
      bindtap={handlePress}
      bindtouchstart={handleTouchStart}
      bindtouchend={handleTouchEnd}
      {...props}
    >
      {leftElement && (
        <view data-slot="list-item-left" className="shrink-0">
          {leftElement}
        </view>
      )}

      <view data-slot="list-item-content" className="flex-1 min-w-0">
        {children}
      </view>

      {rightElement && (
        <view data-slot="list-item-right" className="shrink-0">
          {rightElement}
        </view>
      )}
    </list-item>
  );
}

export { ListItem, listItemVariants };
export type { ListItemProps };
