import { type InputProps as NativeInputProps } from '@lynx-js/types';
interface InputProps extends Omit<NativeInputProps, 'disabled' | 'type'> {
    disabled?: boolean;
    className?: string;
    type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'digit';
    value?: string;
    placeholder?: string;
    onChange?: (value: string) => void;
    onBlur?: () => void;
    onFocus?: () => void;
}
declare function Input({ className, type, ...props }: InputProps): import("react").JSX.Element;
export { Input };
