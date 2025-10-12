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

// TabsList component
const tabsListVariants = cva(
  'flex gap-1 p-1 rounded-lg bg-muted',
  {
    variants: {
      orientation: {
        horizontal: 'flex-row',
        vertical: 'flex-col',
      },
    },
    defaultVariants: {
      orientation: 'horizontal',
    },
  }
);

interface TabsListProps extends ViewProps, VariantProps<typeof tabsListVariants> {}

function TabsList({ className, orientation, children, ...props }: TabsListProps) {
  return (
    <view
      data-slot="tabs-list"
      className={cn(tabsListVariants({ orientation }), className)}
      {...props}
    >
      {children}
    </view>
  );
}

// TabsTrigger component
const tabsTriggerVariants = cva(
  'flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all outline-none disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      active: {
        true: 'bg-background text-foreground shadow-sm',
        false: 'text-muted-foreground',
      },
    },
    defaultVariants: {
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
  const isActive = value === triggerValue;

  const handleClick = () => {
    if (!disabled) {
      onValueChange(triggerValue);
    }
  };

  return (
    <view
      data-slot="tabs-trigger"
      className={cn(tabsTriggerVariants({ active: isActive }), className)}
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

// TabsContent component
interface TabsContentProps extends ViewProps {
  value: string;
}

function TabsContent({ value: contentValue, className, children, ...props }: TabsContentProps) {
  const { value } = useTabsContext();

  if (value !== contentValue) {
    return null;
  }

  return (
    <view
      data-slot="tabs-content"
      className={cn('mt-2', className)}
      {...props}
    >
      {children}
    </view>
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants, tabsTriggerVariants };
