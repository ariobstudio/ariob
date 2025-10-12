import * as React from '@lynx-js/react';
import { type VariantProps } from 'class-variance-authority';
declare const alertVariants: (props?: {
    variant?: "default" | "destructive";
} & import("class-variance-authority/types").ClassProp) => string;
declare function Alert({ className, variant, onDismiss, ...props }: React.ComponentProps<'view'> & VariantProps<typeof alertVariants> & {
    onDismiss?: () => void;
}): React.JSX.Element;
declare function AlertTitle({ className, ...props }: React.ComponentProps<'view'>): React.JSX.Element;
declare function AlertDescription({ className, ...props }: React.ComponentProps<'view'>): React.JSX.Element;
export { Alert, AlertTitle, AlertDescription };
