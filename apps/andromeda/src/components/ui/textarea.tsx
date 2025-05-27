import { useTheme } from '@/hooks/useTheme';
import { colors } from '@/lib/colors';
import { cn } from '@/lib/utils';

function TextArea({ className, ...props }: React.ComponentProps<'textarea'>) {
  const { withTheme } = useTheme();
  return (
    //@ts-ignore
    //TODO: Need to create a native component for this
    <input
      data-slot="textarea"
      className={cn(
        'placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
        className,
      )}
      text-color={withTheme(colors.light.foreground, colors.dark.foreground)}
      placeholder-color={withTheme(
        colors.light.mutedForeground,
        colors.dark.mutedForeground,
      )}
      {...props}
    />
  );
}

export { TextArea };
