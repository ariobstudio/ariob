import { type VariantProps } from 'class-variance-authority';
import type { ViewProps } from '@lynx-js/types';
import type * as React from '@lynx-js/react';
declare const rowVariants: (props?: {
    spacing?: "sm" | "lg" | "none" | "xs" | "md" | "xl";
    align?: "center" | "baseline" | "end" | "start" | "stretch";
    justify?: "center" | "end" | "start" | "between" | "around" | "evenly";
    wrap?: "reverse" | "nowrap" | "wrap";
    width?: "auto" | "screen" | "full" | "fit";
    height?: "auto" | "screen" | "full" | "fit";
} & import("class-variance-authority/types").ClassProp) => string;
interface RowProps extends ViewProps, VariantProps<typeof rowVariants> {
    children?: React.ReactNode;
}
declare function Row({ className, spacing, align, justify, wrap, width, height, children, ...props }: RowProps): React.JSX.Element;
export { Row, rowVariants };
