/**
 * Lynx-compliant Text primitive for Ariob Design System.
 * Supports all Lynx text props, plus size/weight/className for design system use.
 * https://lynxjs.org/guide/styling/text-and-typography.html
 */
export interface TextProps extends React.PropsWithChildren<{}> {
  className?: string;
  style?: React.CSSProperties;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  'text-maxline'?: string;
  'text-maxlength'?: string;
  'enable-font-scaling'?: boolean;
  'text-vertical-align'?: 'bottom' | 'center' | 'top';
  'tail-color-convert'?: boolean;
  'text-selection'?: boolean;
  'text-single-line-vertical-align'?: 'normal' | 'bottom' | 'center' | 'top';
  'include-font-padding'?: boolean;
  'android-emoji-compat'?: boolean;
  'text-fake-bold'?: boolean;
  bindlayout?: (e: any) => void;
}

const sizeMap = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
};

const weightMap = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

/**
 * Text primitive for Lynx and Ariob Design System.
 * - Supports all Lynx text props, plus size/weight/className for design system use.
 * - Forwards all props to the underlying <text> tag.
 */
export const Text: React.FC<TextProps> = ({
  children,
  className = '',
  style,
  size = 'md',
  weight = 'normal',
  ...rest
}) => {
  const classes = [sizeMap[size], weightMap[weight], className]
    .filter(Boolean)
    .join(' ');

  return (
    <text
      className={classes}
      // @ts-ignore
      style={style}
      {...rest}
    >
      {children}
    </text>
  );
};
