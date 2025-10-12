import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from '../../lib/utils';
function Input({ className, type = 'text', ...props }) {
    return (_jsx("input", { type: type, className: cn('border-input flex w-full min-w-0 rounded-none border bg-transparent px-3 py-1 text-base shadow-xs transition-colors outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 text-foreground placeholder:text-muted-foreground placeholder:opacity-60', className), ...props }));
}
export { Input };
