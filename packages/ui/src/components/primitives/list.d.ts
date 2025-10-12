import { type VariantProps } from 'class-variance-authority';
import type { ViewProps } from '@lynx-js/types';
import * as React from '@lynx-js/react';
declare const listVariants: (props?: {
    direction?: "horizontal" | "vertical";
    gap?: "sm" | "lg" | "none" | "xs" | "md" | "xl";
    padding?: "sm" | "lg" | "none" | "xs" | "md" | "xl";
    width?: "auto" | "screen" | "full" | "fit";
    height?: "auto" | "screen" | "full" | "fit";
    variant?: "default" | "inset" | "bordered" | "elevated";
    showScrollbar?: "hidden" | "auto" | "visible";
} & import("class-variance-authority/types").ClassProp) => string;
interface ListComponentProps<T = any> extends Omit<ViewProps, 'data'>, VariantProps<typeof listVariants> {
    data?: T[];
    renderItem?: (item: T, index: number) => React.ReactNode;
    keyExtractor?: (item: T, index: number) => string;
    onEndReached?: () => void;
    onEndReachedThreshold?: number;
    onScroll?: () => void;
    onItemPress?: (item: T, index: number) => void;
    emptyComponent?: React.ReactNode;
    headerComponent?: React.ReactNode;
    footerComponent?: React.ReactNode;
}
declare function List<T = any>({ className, direction, gap, padding, width, height, variant, showScrollbar, data, renderItem, keyExtractor, onEndReached, onEndReachedThreshold, onScroll, onItemPress, emptyComponent, headerComponent, footerComponent, children, ...props }: ListComponentProps<T>): React.JSX.Element;
export { List, listVariants };
