import * as React from '@lynx-js/react';
import { useState, createContext, useContext } from '@lynx-js/react';
import { type ViewProps } from '@lynx-js/types';
import { cn } from '../../lib/utils';
import { Icon } from './icon';
import type { LynxReactNode } from '../../types/react';

// Context for managing accordion state
interface AccordionContextValue {
  value: string[];
  onValueChange: (value: string) => void;
  type: 'single' | 'multiple';
}

const AccordionContext = createContext<AccordionContextValue | undefined>(undefined);

const useAccordion = () => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('Accordion components must be used within an Accordion');
  }
  return context;
};

interface AccordionProps extends ViewProps {
  /**
   * Type of accordion - single or multiple items open
   * @default "single"
   */
  type?: 'single' | 'multiple';
  /**
   * Default open items
   */
  defaultValue?: string | string[];
  /**
   * Controlled value
   */
  value?: string | string[];
  /**
   * Callback when value changes
   */
  onValueChange?: (value: string | string[]) => void;
  children?: LynxReactNode;
}

/**
 * Accordion - Collapsible content sections
 *
 * Custom implementation for LynxJS without Radix UI
 *
 * @example
 * ```tsx
 * <Accordion type="single" defaultValue="item-1">
 *   <AccordionItem value="item-1">
 *     <AccordionTrigger>Section 1</AccordionTrigger>
 *     <AccordionContent>Content for section 1</AccordionContent>
 *   </AccordionItem>
 * </Accordion>
 * ```
 */
function Accordion({
  type = 'single',
  defaultValue,
  value: controlledValue,
  onValueChange,
  className,
  children,
  style,
  ...restProps
}: AccordionProps) {
  const [internalValue, setInternalValue] = useState<string[]>(() => {
    if (defaultValue) {
      return Array.isArray(defaultValue) ? defaultValue : [defaultValue];
    }
    return [];
  });

  const value = controlledValue
    ? Array.isArray(controlledValue)
      ? controlledValue
      : [controlledValue]
    : internalValue;

  const handleValueChange = (itemValue: string) => {
    'background only';
    let newValue: string[];

    if (type === 'single') {
      newValue = value.includes(itemValue) ? [] : [itemValue];
    } else {
      newValue = value.includes(itemValue)
        ? value.filter((v) => v !== itemValue)
        : [...value, itemValue];
    }

    if (!controlledValue) {
      setInternalValue(newValue);
    }

    if (onValueChange) {
      onValueChange(type === 'single' ? newValue[0] || '' : newValue);
    }
  };

  return (
    <AccordionContext.Provider value={{ value, onValueChange: handleValueChange, type }}>
      <view data-slot="accordion" className={cn('w-full', className)} style={style}>
        {children}
      </view>
    </AccordionContext.Provider>
  );
}

// Context for individual accordion item
interface AccordionItemContextValue {
  isOpen: boolean;
  value: string;
}

const AccordionItemContext = createContext<AccordionItemContextValue | undefined>(undefined);

interface AccordionItemProps extends ViewProps {
  value: string;
  children?: LynxReactNode;
}

function AccordionItem({ value, className, children, style, ...restProps }: AccordionItemProps) {
  const { value: openValues } = useAccordion();
  const isOpen = openValues.includes(value);

  return (
    <AccordionItemContext.Provider value={{ isOpen, value }}>
      <view
        data-slot="accordion-item"
        className={cn('border-b border-border last:border-b-0', className)}
        style={style}
      >
        {children}
      </view>
    </AccordionItemContext.Provider>
  );
}

interface AccordionTriggerProps extends ViewProps {
  children?: LynxReactNode;
}

function AccordionTrigger({ className, children, style, ...restProps }: AccordionTriggerProps) {
  const { onValueChange } = useAccordion();
  const itemContext = useContext(AccordionItemContext);

  if (!itemContext) {
    throw new Error('AccordionTrigger must be used within an AccordionItem');
  }

  const { isOpen, value } = itemContext;

  const handleTap = () => {
    'background only';
    onValueChange(value);
  };

  return (
    <view className="flex">
      <view
        data-slot="accordion-trigger"
        className={cn(
          'flex flex-1 items-center justify-between gap-4 py-4 text-left text-sm font-medium transition-all outline-none cursor-pointer',
          className
        )}
        bindtap={handleTap}
        style={style}
      >
        <view className="flex-1">
          {typeof children === 'string' ? (
            <text className="text-foreground">{children}</text>
          ) : (
            children
          )}
        </view>
        <view
          className={cn(
            'text-muted-foreground shrink-0 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        >
          <Icon name="chevron-down" className="size-4" />
        </view>
      </view>
    </view>
  );
}

interface AccordionContentProps extends ViewProps {
  children?: LynxReactNode;
}

function AccordionContent({ className, children }: AccordionContentProps) {
  const itemContext = useContext(AccordionItemContext);
  const isOpen = itemContext?.isOpen || false;

  return (
    <view
      data-slot="accordion-content"
      data-state={isOpen ? 'open' : 'closed'}
      className={cn(
        'overflow-hidden text-sm',
        className
      )}
      style={{
        maxHeight: isOpen ? '500px' : '0px',
        transition: 'max-height 0.3s ease-out',
      }}
    >
      <view className="pt-0 pb-4">
        {typeof children === 'string' ? (
          <text className="text-muted-foreground">{children}</text>
        ) : (
          children
        )}
      </view>
    </view>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
export type { AccordionProps, AccordionItemProps, AccordionTriggerProps, AccordionContentProps };
