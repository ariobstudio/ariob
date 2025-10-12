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

function Input({ className, type = 'text', onChange, onBlur, onFocus, ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        'border-input flex w-full min-w-0 rounded-none border bg-transparent px-3 py-1 text-base shadow-xs transition-colors outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 text-foreground placeholder:text-muted-foreground placeholder:opacity-60',
        className,
      )}
      bindinput={onChange ? (e: any) => onChange(e.detail.value) : undefined}
      bindblur={onBlur}
      bindfocus={onFocus}
      {...props}
    />
  );
}

export { Input };
