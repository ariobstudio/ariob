import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from '@lynx-js/react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';
const alertVariants = cva('relative w-full rounded-lg border border-border px-4 py-3 flex items-start gap-3', {
    variants: {
        variant: {
            default: 'bg-card',
            destructive: 'bg-card *:data-[slot=alert-description]:text-destructive/90',
        },
    },
    defaultVariants: {
        variant: 'default',
    },
});
const textVariants = cva('text-sm', {
    variants: {
        variant: {
            default: 'text-card-foreground',
            destructive: 'text-destructive',
        },
    },
    defaultVariants: {
        variant: 'default',
    },
});
function Alert({ className, variant, onDismiss, ...props }) {
    return (_jsxs("view", { "data-slot": "alert", className: cn(alertVariants({ variant }), className), children: [_jsx("view", { className: "flex-1", children: _jsx("text", { className: cn(textVariants({ variant }), className), children: props.children }) }), onDismiss && (_jsx("view", { className: "flex-shrink-0 cursor-pointer opacity-70 hover:opacity-100", bindtap: onDismiss, children: _jsx("text", { className: cn(textVariants({ variant }), 'text-base'), children: "\u2715" }) }))] }));
}
function AlertTitle({ className, ...props }) {
    return (_jsx("view", { "data-slot": "alert-title", className: cn('col-start-2 line-clamp-1 min-h-4', className), children: _jsx("text", { className: "font-medium tracking-tight", children: props.children }) }));
}
function AlertDescription({ className, ...props }) {
    return (_jsx("view", { "data-slot": "alert-description", className: cn('flex-1 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed', className), children: _jsx("text", { className: "text-muted-foreground whitespace-pre-wrap break-words", children: props.children }) }));
}
export { Alert, AlertTitle, AlertDescription };
