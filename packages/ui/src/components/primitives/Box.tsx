
/**
 * Box: the most basic layout primitive, wraps a `view`.
 * Supports bg, p, m, shadow, border, and other style props.
 */
export interface BoxProps extends React.ComponentProps<'view'> {
  bg?: string; // background color token or class
  p?: string | number; // padding (token key or px)
  m?: string | number; // margin
  shadow?: string; // shadow token or class
  border?: string; // border token or class
  [key: string]: any;
}

export const Box: React.FC<BoxProps> = ({
  bg,
  p,
  m,
  shadow,
  border,
  className = '',
  style,
  children,
  ...rest
}) => {
  // Map props to className (using Tailwind or token mapping)
  const classes = [
    bg ? `bg-${bg}` : '',
    p !== undefined ? (typeof p === 'number' ? `p-${p}` : p) : '',
    m !== undefined ? (typeof m === 'number' ? `m-${m}` : m) : '',
    shadow ? `shadow-${shadow}` : '',
    border ? `border-${border}` : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <view className={classes} style={style} {...rest}>
      {children}
    </view>
  );
};
