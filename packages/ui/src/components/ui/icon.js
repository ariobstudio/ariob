import { jsx as _jsx } from "react/jsx-runtime";
import lucideGlyphs from '../../lib/lucide.json';
import { cn } from '../../lib/utils';
import { cva } from 'class-variance-authority';
const iconVariants = cva('flex items-center justify-center', {
    variants: {
        size: {
            default: 'text-base',
            sm: 'text-sm',
            lg: 'text-lg',
            icon: 'text-base',
        },
    },
    defaultVariants: {
        size: 'default',
    },
});
export const Icon = ({ name, size, className, style, ...props }) => {
    const glyphCode = lucideGlyphs[name];
    const glyph = glyphCode ? String.fromCodePoint(glyphCode) : '?';
    return (_jsx("text", { className: cn(iconVariants({ size }), className), style: {
            fontFamily: 'Icon',
            lineHeight: 1,
        }, ...props, children: glyph }));
};
