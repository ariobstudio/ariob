import { type VariantProps } from 'class-variance-authority';
import * as React from '@lynx-js/react';
import lucideGlyphs from '../../lib/lucide.json';
import { type ViewProps } from '@lynx-js/types';
declare const buttonVariants: (props?: {
    variant?: "default" | "destructive" | "link" | "ghost" | "outline" | "secondary";
    size?: "default" | "sm" | "lg" | "icon";
} & import("class-variance-authority/types").ClassProp) => string;
interface ButtonProps extends ViewProps, VariantProps<typeof buttonVariants> {
    icon?: keyof typeof lucideGlyphs;
    disabled?: boolean;
    onClick?: () => void;
}
declare function Button({ className, variant, size, icon, ...props }: ButtonProps): React.JSX.Element;
export { Button, buttonVariants };
