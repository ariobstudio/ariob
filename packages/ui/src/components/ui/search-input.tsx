import { cn } from '../../lib/utils';
import type { InputProps as NativeInputProps } from '@lynx-js/types';
import { Icon } from './icon';

interface SearchInputProps extends Omit<NativeInputProps, 'disabled' | 'type'> {
  disabled?: boolean;
  className?: string;
  value?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  /**
   * Show loading indicator
   */
  loading?: boolean;
  /**
   * Callback when clear button is clicked
   */
  onClear?: () => void;
}

function SearchInput({
  className,
  onChange,
  onBlur,
  onFocus,
  onClear,
  value,
  loading,
  ...props
}: SearchInputProps) {
  const handleClear = () => {
    if (onClear) {
      onClear();
    } else if (onChange) {
      onChange('');
    }
  };

  return (
    <view
      data-slot="search-input"
      className={cn(
        'relative flex items-center w-full',
        className
      )}
    >
      <view className="absolute left-3 flex items-center justify-center pointer-events-none">
        <Icon name="search" size="sm" className="text-muted-foreground" />
      </view>

      <input
        type="text"
        className={cn(
          'border-input flex w-full min-w-0 rounded-lg border bg-background pl-10 pr-10 py-2 text-sm shadow-xs transition-colors outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 text-foreground placeholder:text-muted-foreground placeholder:opacity-60',
          'focus:border-ring focus:ring-ring/20 focus:ring-2'
        )}
        bindinput={onChange ? (e: any) => onChange(e.detail.value) : undefined}
        bindblur={onBlur}
        bindfocus={onFocus}
        {...props}
      />

      {(value || loading) && (
        <view className="absolute right-3 flex items-center justify-center">
          {loading ? (
            <Icon name="loader" size="sm" className="text-muted-foreground animate-spin" />
          ) : (
            <view bindtap={handleClear} className="cursor-pointer">
              <Icon name="x" size="sm" className="text-muted-foreground hover:text-foreground transition-colors" />
            </view>
          )}
        </view>
      )}
    </view>
  );
}

export { SearchInput };
export type { SearchInputProps };
