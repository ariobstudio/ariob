import { type VariantProps } from 'class-variance-authority';
import * as React from '@lynx-js/react';
import type { ScrollViewProps } from '@lynx-js/types';
declare const scrollableVariants: (props?: {
    direction?: "both" | "horizontal" | "vertical";
    gap?: "sm" | "lg" | "none" | "xs" | "md" | "xl";
    padding?: "sm" | "lg" | "none" | "xs" | "md" | "xl";
    width?: "auto" | "screen" | "full" | "fit";
    height?: "auto" | "screen" | "full" | "fit";
    showScrollbar?: "hidden" | "auto" | "visible";
} & import("class-variance-authority/types").ClassProp) => string;
interface ScrollableProps extends Omit<ScrollViewProps, 'scroll-x' | 'scroll-y'>, VariantProps<typeof scrollableVariants> {
    onScrollEnd?: () => void;
    onScrollStart?: () => void;
    children?: React.ReactNode;
}
declare function Scrollable({ className, direction, gap, padding, width, height, showScrollbar, onScrollEnd, onScrollStart, ...props }: ScrollableProps): React.JSX.Element;
export { Scrollable, scrollableVariants };
