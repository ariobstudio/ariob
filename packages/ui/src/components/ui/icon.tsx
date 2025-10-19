import { type TextProps } from '@lynx-js/types';
import lucideGlyphs from '../../lib/lucide.json';
import { cn } from '../../lib/utils';
import { type VariantProps, cva } from 'class-variance-authority';

const iconVariants = cva('', {
  variants: {
    size: {
      default: 'text-base',
      sm: 'text-sm',
      lg: 'text-lg',
      icon: 'text-base',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

export type IconProps = {
  name: keyof typeof lucideGlyphs;
  size?: VariantProps<typeof iconVariants>['size'];
  className?: string;
};

export const Icon = ({ name, size, className, ...props }: IconProps & TextProps) => {
  const glyphCode = lucideGlyphs[name];
  const glyph = glyphCode ? String.fromCodePoint(glyphCode) : '?';
  return (
    <text
      className={cn(iconVariants({ size }), className)}
      style={{
        fontFamily: 'Icon',
        lineHeight: 1,
        textAlign: 'center',
      }}
      {...props}
    >
      {glyph}
    </text>
  );
};
