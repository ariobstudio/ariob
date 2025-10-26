/**
 * Tabs Component
 *
 * Material Design-compliant tab navigation with support for:
 * - Contained tabs (default) - tabs in a rounded container
 * - Scrollable tabs - horizontally scrollable with animated indicator
 * - Swipeable content - native scroll-based panel switching
 *
 * @see https://m2.material.io/components/tabs
 */

import * as React from '@lynx-js/react';
import { type ViewProps } from '@lynx-js/types';
import { type VariantProps, cva } from 'class-variance-authority';

import { cn } from '../../lib/utils';

// Context for managing active tab
interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined);

const useTabsContext = () => {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs component');
  }
  return context;
};

// Context for TabsList variant (provides styling context to triggers)
interface TabsListContextValue {
  variant: 'contained' | 'scrollable';
}

const TabsListContext = React.createContext<TabsListContextValue>({ variant: 'contained' });

const useTabsListContext = () => {
  return React.useContext(TabsListContext);
};

// Tabs root component
interface TabsProps extends ViewProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

function Tabs({ defaultValue, value: controlledValue, onValueChange, className, children, ...props }: TabsProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue || '');

  const value = controlledValue !== undefined ? controlledValue : internalValue;
  const handleValueChange = (newValue: string) => {
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  };

  return (
    <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
      <view data-slot="tabs" className={cn('w-full', className)} {...props}>
        {children}
      </view>
    </TabsContext.Provider>
  );
}

/**
 * TabsList - Container for tab triggers
 *
 * Material Design tab bar with two variants:
 * - contained: Tabs enclosed in rounded background (default)
 * - scrollable: Horizontally scrollable tabs with bottom border and indicator
 *
 * @example
 * <TabsList variant="scrollable">
 *   <TabsTrigger value="tab1">Tab 1</TabsTrigger>
 * </TabsList>
 */
const tabsListVariants = cva(
  'flex',
  {
    variants: {
      variant: {
        contained: 'gap-1 p-1 rounded-lg bg-muted',
        scrollable: 'gap-0 border-b border-border relative',
      },
      orientation: {
        horizontal: 'flex-row',
        vertical: 'flex-col',
      },
    },
    defaultVariants: {
      variant: 'contained',
      orientation: 'horizontal',
    },
  }
);

interface TabsListProps extends ViewProps, VariantProps<typeof tabsListVariants> {}

function TabsList({ className, variant = 'contained', orientation, children, ...props }: TabsListProps) {
  const isScrollable = variant === 'scrollable';
  const safeVariant = variant || 'contained'; // Ensure non-null for context

  const content = (
    <TabsListContext.Provider value={{ variant: safeVariant }}>
      <view
        data-slot="tabs-list"
        className={cn(tabsListVariants({ variant, orientation }), className)}
        {...props}
      >
        {children}
      </view>
    </TabsListContext.Provider>
  );

  // Wrap in horizontal scroll-view for scrollable variant
  if (isScrollable && orientation === 'horizontal') {
    return (
      <scroll-view
        scroll-orientation="horizontal"
        enable-scroll={true}
        scroll-bar-enable={false}
        className="w-full"
      >
        {content}
      </scroll-view>
    );
  }

  return content;
}

/**
 * TabsTrigger - Individual tab button
 *
 * Adapts styling based on parent TabsList variant:
 * - contained: Rounded with background when active
 * - scrollable: Flat with bottom indicator (managed by TabsIndicator)
 *
 * @example
 * <TabsTrigger value="tab1">
 *   <Text>Tab 1</Text>
 * </TabsTrigger>
 */
const tabsTriggerVariants = cva(
  'flex items-center justify-center whitespace-nowrap px-4 py-3 text-sm font-medium transition-all outline-none disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        contained: 'rounded-md',
        scrollable: 'rounded-none min-w-[90px]', // Material Design minimum touch target
      },
      active: {
        true: '',
        false: 'text-muted-foreground',
      },
    },
    compoundVariants: [
      {
        variant: 'contained',
        active: true,
        className: 'bg-background text-foreground shadow-sm',
      },
      {
        variant: 'scrollable',
        active: true,
        className: 'text-primary',
      },
    ],
    defaultVariants: {
      variant: 'contained',
      active: false,
    },
  }
);

interface TabsTriggerProps extends ViewProps {
  value: string;
  disabled?: boolean;
}

function TabsTrigger({ value: triggerValue, disabled, className, children, ...props }: TabsTriggerProps) {
  const { value, onValueChange } = useTabsContext();
  const { variant } = useTabsListContext();
  const isActive = value === triggerValue;

  const handleClick = () => {
    if (!disabled) {
      onValueChange(triggerValue);
    }
  };

  return (
    <view
      data-slot="tabs-trigger"
      className={cn(tabsTriggerVariants({ variant, active: isActive }), className)}
      bindtap={handleClick}
      {...props}
    >
      {typeof children === 'string' ? (
        <text>{children}</text>
      ) : (
        children
      )}
    </view>
  );
}

/**
 * TabsPanel - Content panel for a tab
 *
 * Displays content when its value matches the active tab.
 * Use within SwipeableTabsContent for swipeable behavior,
 * or standalone for simple tab switching.
 *
 * @example
 * <TabsPanel value="tab1">
 *   <Text>Tab 1 Content</Text>
 * </TabsPanel>
 */
interface TabsPanelProps extends ViewProps {
  value: string;
}

function TabsPanel({ value: contentValue, className, children, ...props }: TabsPanelProps) {
  const { value } = useTabsContext();

  if (value !== contentValue) {
    return null;
  }

  return (
    <view
      data-slot="tabs-panel"
      className={cn('mt-2', className)}
      {...props}
    >
      {children}
    </view>
  );
}

// Backwards compatibility alias
const TabsContent = TabsPanel;

/**
 * SwipeableTabsContent - Container for swipeable tab panels
 *
 * Enables horizontal swiping between tab panels using native scroll-view
 * with snap points. Automatically syncs with active tab value.
 *
 * Behavior:
 * - Horizontal scroll with page snap
 * - Updates active tab on scroll end
 * - Allows vertical scrolling within panels
 * - Native momentum scrolling physics
 * - Always renders ALL panels (don't use conditional TabsPanel)
 *
 * @example
 * <SwipeableTabsContent>
 *   <view>{content1}</view>
 *   <view>{content2}</view>
 * </SwipeableTabsContent>
 */
interface SwipeableTabsContentProps extends ViewProps {
  children: React.ReactNode;
}

function SwipeableTabsContent({ className, children, ...props }: SwipeableTabsContentProps) {
  const { onValueChange } = useTabsContext();

  // Convert children to array (LynxJS compatible way)
  const childrenArray = Array.isArray(children) ? children : [children];

  // Map of valid degree values
  const degreeValues = ['0', '1', '2'];

  const handleScrollEnd = (e: any) => {
    'background only';
    const scrollLeft = e.detail?.scrollLeft || 0;
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 375;
    const index = Math.round(scrollLeft / viewportWidth);

    // Update to the degree at this index
    if (index >= 0 && index < degreeValues.length) {
      const newValue = degreeValues[index];
      console.log('[SwipeableTabsContent] Scrolled to index:', index, 'degree:', newValue);
      onValueChange(newValue);
    }
  };

  return (
    <scroll-view
      data-slot="swipeable-tabs-content"
      className={cn('flex-1 w-full overflow-hidden', className)}
      scroll-orientation="horizontal"
      enable-scroll={true}
      scroll-bar-enable={false}
      bindscrollend={handleScrollEnd}
      style={{
        display: 'flex',
        flexDirection: 'row',
        scrollSnapType: 'x mandatory',
        WebkitOverflowScrolling: 'touch',
      }}
      {...props}
    >
      {childrenArray.map((child: any, index: number) => (
        <view
          key={degreeValues[index] || index}
          data-degree={degreeValues[index]}
          className="flex-shrink-0"
          style={{
            width: '100vw',
            minWidth: '100vw',
            maxWidth: '100vw',
            height: '100%',
            scrollSnapAlign: 'start',
            scrollSnapStop: 'always',
          }}
        >
          {/* Render panel content directly */}
          {child}
        </view>
      ))}
    </scroll-view>
  );
}

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsPanel,
  TabsContent, // Backwards compatibility
  SwipeableTabsContent,
  tabsListVariants,
  tabsTriggerVariants,
};
