import { type VariantProps } from 'class-variance-authority';
import type { ViewProps } from '@lynx-js/types';
import * as React from '@lynx-js/react';
declare const listItemVariants: (props?: {
    variant?: "default" | "ghost" | "none" | "card" | "bordered";
    size?: "sm" | "lg" | "md";
    state?: "default" | "active" | "disabled" | "selected";
    align?: "center" | "end" | "start" | "between";
    direction?: "column" | "row";
} & import("class-variance-authority/types").ClassProp) => string;
interface ListItemProps extends ViewProps, VariantProps<typeof listItemVariants> {
    onPress?: () => void;
    selected?: boolean;
    disabled?: boolean;
    leftElement?: React.ReactNode;
    rightElement?: React.ReactNode;
    title?: string;
    subtitle?: string;
    description?: string;
    children?: React.ReactNode;
}
declare function ListItem({ className, variant, size, state, align, direction, onPress, selected, disabled, leftElement, rightElement, title, subtitle, description, children, ...props }: ListItemProps): React.JSX.Element;
export { ListItem, listItemVariants };
