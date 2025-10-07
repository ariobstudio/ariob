import { type VariantProps } from 'class-variance-authority';
import type { ViewProps } from '@lynx-js/types';
import type * as React from '@lynx-js/react';
declare const columnVariants: (props?: {
    spacing?: "sm" | "lg" | "none" | "xs" | "md" | "xl";
    align?: "center" | "end" | "start" | "stretch";
    justify?: "center" | "end" | "start" | "between" | "around" | "evenly";
    width?: "auto" | "screen" | "full" | "fit";
    height?: "auto" | "screen" | "full" | "fit";
} & import("class-variance-authority/types").ClassProp) => string;
interface ColumnProps extends ViewProps, VariantProps<typeof columnVariants> {
    children?: React.ReactNode;
}
declare function Column({ className, spacing, align, justify, width, height, children, ...props }: ColumnProps): React.JSX.Element;
export { Column, columnVariants };
