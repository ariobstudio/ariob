import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from '../../lib/utils';
function TextArea({ className, rows = 3, ...props }) {
    return (_jsx("textarea", { "data-slot": "textarea", "max-lines": rows, className: cn('border-input flex w-full min-w-0 rounded-md border bg-transparent p-4 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm text-foreground placeholder:text-muted-foreground placeholder:opacity-60', 
        // 'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        // 'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
        className), ...props }));
}
export { TextArea };
