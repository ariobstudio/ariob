import { cn } from '../../lib/utils';

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

function TextArea({ className, rows = 3, ...props }: TextAreaProps) {
  return (
    <textarea
      data-slot="textarea"
      max-lines={rows}
      className={cn(
        'border-input flex w-full min-w-0 rounded-md border bg-transparent p-4 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm text-foreground placeholder:text-muted-foreground placeholder:opacity-60',
        // 'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        // 'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
        className,
      )}
      {...props}
    />
  );
}

export { TextArea };
export type { TextAreaProps };
