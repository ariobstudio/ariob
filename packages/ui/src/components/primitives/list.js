import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cva } from 'class-variance-authority';
import * as React from '@lynx-js/react';
import { cn } from '../../lib/utils';
const listVariants = cva('', {
    variants: {
        direction: {
            vertical: 'flex flex-col',
            horizontal: 'flex flex-row',
        },
        gap: {
            none: '',
            xs: 'gap-1',
            sm: 'gap-2',
            md: 'gap-4',
            lg: 'gap-6',
            xl: 'gap-8',
        },
        padding: {
            none: '',
            xs: 'p-1',
            sm: 'p-2',
            md: 'p-4',
            lg: 'p-6',
            xl: 'p-8',
        },
        width: {
            auto: 'w-auto',
            full: 'w-full',
            fit: 'w-fit',
            screen: 'w-screen',
        },
        height: {
            auto: 'h-auto',
            full: 'h-full',
            fit: 'h-fit',
            screen: 'h-screen',
        },
        variant: {
            default: '',
            bordered: 'border border-border rounded-lg',
            elevated: 'bg-card shadow-md rounded-lg',
            inset: 'bg-muted/50 rounded-lg',
        },
        showScrollbar: {
            auto: '',
            hidden: 'scrollbar-hide',
            visible: 'scrollbar-default',
        },
    },
    defaultVariants: {
        direction: 'vertical',
        gap: 'none',
        padding: 'none',
        width: 'full',
        height: 'auto',
        variant: 'default',
        showScrollbar: 'auto',
    },
});
function List({ className, direction, gap, padding, width, height, variant, showScrollbar, data = [], renderItem, keyExtractor, onEndReached, onEndReachedThreshold, onScroll, onItemPress, emptyComponent, headerComponent, footerComponent, children, ...props }) {
    // If renderItem is provided, use data-driven rendering
    if (renderItem && data.length > 0) {
        return (_jsxs("list", { "data-slot": "list", className: cn(listVariants({
                direction,
                gap,
                padding,
                width,
                height,
                variant,
                showScrollbar,
                className,
            })), bindscroll: onScroll, ...props, children: [headerComponent, data.map((item, index) => {
                    const key = keyExtractor ? keyExtractor(item, index) : index;
                    return (_jsx("view", { "data-slot": "list-item-wrapper", bindtap: () => onItemPress?.(item, index), children: renderItem(item, index) }, key));
                }), footerComponent] }));
    }
    // If no data but children provided, render children
    if (children) {
        return (_jsxs("list", { "data-slot": "list", className: cn(listVariants({
                direction,
                gap,
                padding,
                width,
                height,
                variant,
                showScrollbar,
                className,
            })), bindscroll: onScroll, ...props, children: [headerComponent, children, footerComponent] }));
    }
    // Empty state
    return (_jsx("list", { "data-slot": "list", className: cn(listVariants({
            direction,
            gap,
            padding,
            width,
            height,
            variant,
            showScrollbar,
            className,
        })), ...props, children: emptyComponent || (_jsx("view", { className: "flex-1 flex items-center justify-center p-8", children: _jsx("text", { className: "text-muted-foreground text-sm", children: "No items" }) })) }));
}
export { List, listVariants };
