import { type VariantProps, cva } from 'class-variance-authority';

import lucideGlyphs from '@/lib/lucide.json';
import { cn } from '@/lib/utils';
import { Icon } from './icon';

const buttonVariants = cva(
  "flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: 'bg-primary shadow-xs',
        destructive: 'bg-destructive shadow-xs',
        outline: 'border border-border bg-background shadow-xs',
        secondary: 'bg-secondary shadow-xs',
        ghost: '',
        link: 'text-primary',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md gap-1.5 px-3',
        lg: 'h-10 rounded-md px-6',
        icon: 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

const textVariants = cva('', {
  variants: {
    variant: {
      default: 'text-primary-foreground',
      destructive: 'text-white',
      outline: 'text-accent-foreground',
      secondary: 'text-secondary-foreground',
      ghost: 'text-accent-foreground',
      link: 'text-primary',
    },
    size: {
      default: 'text-sm',
      sm: 'text-xs',
      lg: 'text-base',
      icon: 'text-sm',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

interface ButtonProps
  extends React.ComponentProps<'view'>,
    VariantProps<typeof buttonVariants> {
  icon?: keyof typeof lucideGlyphs;
}

function Button({ className, variant, size, icon, ...props }: ButtonProps) {
  return (
    <view
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {icon && (
        <Icon
          className={cn(textVariants({ variant }))}
          name={icon}
          size={size}
        />
      )}
      {props.children && (
        <text className={cn(textVariants({ variant, size, className }))}>
          {props.children}
        </text>
      )}
    </view>
  );
}

export { Button, buttonVariants };
