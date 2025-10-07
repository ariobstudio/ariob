import { jsx as _jsx } from "react/jsx-runtime";
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';
const rowVariants = cva('flex flex-row', {
    variants: {
        spacing: {
            none: '',
            xs: 'gap-1',
            sm: 'gap-2',
            md: 'gap-4',
            lg: 'gap-6',
            xl: 'gap-8',
        },
        align: {
            start: 'items-start',
            center: 'items-center',
            end: 'items-end',
            stretch: 'items-stretch',
            baseline: 'items-baseline',
        },
        justify: {
            start: 'justify-start',
            center: 'justify-center',
            end: 'justify-end',
            between: 'justify-between',
            around: 'justify-around',
            evenly: 'justify-evenly',
        },
        wrap: {
            wrap: 'flex-wrap',
            nowrap: 'flex-nowrap',
            reverse: 'flex-wrap-reverse',
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
    },
    defaultVariants: {
        spacing: 'md',
        align: 'center',
        justify: 'start',
        wrap: 'nowrap',
        width: 'auto',
        height: 'auto',
    },
});
function Row({ className, spacing, align, justify, wrap, width, height, children, ...props }) {
    return (_jsx("view", { "data-slot": "row", className: cn(rowVariants({
            spacing,
            align,
            justify,
            wrap,
            width,
            height,
            className,
        })), ...props, children: children }));
}
export { Row, rowVariants };
