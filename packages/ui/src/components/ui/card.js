import { jsx as _jsx } from "react/jsx-runtime";
import * as React from '@lynx-js/react';
import { cn } from '../../lib/utils';
function Card({ className, ...props }) {
    const { children, ...rest } = props;
    return (_jsx("view", { "data-slot": "card", className: cn('bg-card text-card-foreground flex flex-col gap-6 rounded-xl border border-border py-6', className), ...rest, children: children }));
}
function CardHeader({ className, ...props }) {
    return (_jsx("view", { "data-slot": "card-header", className: cn('@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6', className), children: props.children }));
}
function CardTitle({ className, ...props }) {
    return (_jsx("text", { "data-slot": "card-title", className: cn('leading-none font-semibold', className), children: props.children }));
}
function CardDescription({ className, ...props }) {
    return (_jsx("text", { "data-slot": "card-description", className: cn('text-muted-foreground text-sm', className), children: props.children }));
}
function CardAction({ className, ...props }) {
    return (_jsx("view", { "data-slot": "card-action", className: cn('col-start-2 self-start justify-self-end', className), children: props.children }));
}
function CardContent({ className, ...props }) {
    return (_jsx("view", { "data-slot": "card-content", className: cn('px-6', className), children: props.children }));
}
function CardFooter({ className, ...props }) {
    return (_jsx("view", { "data-slot": "card-footer", className: cn('flex items-center px-6 [.border-t]:pt-6', className), children: props.children }));
}
export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent, };
