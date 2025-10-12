import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cva } from 'class-variance-authority';
import * as React from '@lynx-js/react';
import { cn } from '../../lib/utils';
const listItemVariants = cva('flex items-center transition-all duration-200 outline-none', {
    variants: {
        variant: {
            default: 'hover:bg-accent/50 active:bg-accent/70',
            ghost: 'hover:bg-muted/50 active:bg-muted/70',
            bordered: 'border-b border-border last:border-b-0',
            card: 'bg-card border border-border rounded-lg shadow-sm hover:shadow-md',
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
});
function ListItem({ className, variant, size, state, align, direction, onPress, selected, disabled, leftElement, rightElement, title, subtitle, description, children, ...props }) {
    // Determine the state based on props
    const itemState = React.useMemo(() => {
        if (disabled)
            return 'disabled';
        if (selected)
            return 'selected';
        return state;
    }, [disabled, selected, state]);
    const handlePress = React.useCallback(() => {
        if (!disabled && onPress) {
            onPress();
        }
    }, [disabled, onPress]);
    // If title/subtitle provided, render structured content
    if (title || subtitle || description) {
        return (_jsxs("view", { "data-slot": "list-item", className: cn(listItemVariants({
                variant,
                size,
                state: itemState,
                align,
                direction,
                className,
            })), bindtap: handlePress, ...props, children: [leftElement && (_jsx("view", { "data-slot": "list-item-left", className: "shrink-0", children: leftElement })), _jsxs("view", { "data-slot": "list-item-content", className: cn('flex-1 min-w-0', direction === 'column'
                        ? 'flex flex-col gap-1'
                        : 'flex flex-col gap-0.5'), children: [title && (_jsx("text", { "data-slot": "list-item-title", className: "font-medium text-foreground truncate", children: title })), subtitle && (_jsx("text", { "data-slot": "list-item-subtitle", className: "text-sm text-muted-foreground truncate", children: subtitle })), description && (_jsx("text", { "data-slot": "list-item-description", className: "text-xs text-muted-foreground line-clamp-2", children: description })), children] }), rightElement && (_jsx("view", { "data-slot": "list-item-right", className: "shrink-0", children: rightElement }))] }));
    }
    // If no structured content, render children directly
    return (_jsxs("view", { "data-slot": "list-item", className: cn(listItemVariants({
            variant,
            size,
            state: itemState,
            align,
            direction,
            className,
        })), bindtap: handlePress, ...props, children: [leftElement && (_jsx("view", { "data-slot": "list-item-left", className: "shrink-0", children: leftElement })), _jsx("view", { "data-slot": "list-item-content", className: "flex-1 min-w-0", children: children }), rightElement && (_jsx("view", { "data-slot": "list-item-right", className: "shrink-0", children: rightElement }))] }));
}
export { ListItem, listItemVariants };
