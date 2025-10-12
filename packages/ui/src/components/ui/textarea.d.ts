interface TextAreaProps {
    className?: string;
    disabled?: boolean;
    value?: string;
    placeholder?: string;
    rows?: number;
    'auto-height'?: boolean;
    bindinput?: (event: any) => void;
    bindfocus?: (event: any) => void;
    bindblur?: (event: any) => void;
    [key: string]: any;
}
declare function TextArea({ className, rows, ...props }: TextAreaProps): import("react").JSX.Element;
export { TextArea };
export type { TextAreaProps };
