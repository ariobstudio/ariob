import { cn } from '../../lib/utils';
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

function Input({ className, type = 'text', ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        'border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-colors outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 text-foreground',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
