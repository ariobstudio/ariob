import { type TextProps } from '@lynx-js/types';
import lucideGlyphs from '../../lib/lucide.json';
import { type VariantProps } from 'class-variance-authority';
declare const iconVariants: (props?: {
    size?: "default" | "sm" | "lg" | "icon";
} & import("class-variance-authority/types").ClassProp) => string;
export type IconProps = {
    name: keyof typeof lucideGlyphs;
    size?: VariantProps<typeof iconVariants>['size'];
    className?: string;
    style?: React.CSSProperties;
};
export declare const Icon: ({ name, size, className, style, ...props }: IconProps & TextProps) => import("react").JSX.Element;
export {};
