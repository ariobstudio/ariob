import { useTheme } from '@/src/components/ThemeProvider';

export interface PageProps extends React.ComponentProps<'page'> {
  className?: string;
  children: React.ReactNode;
}

export const Page: React.FC<PageProps> = ({ className = '', style, children, ...rest }) => {
  const { withTheme } = useTheme();
  return (
    <page className={withTheme('bg-background text-on-background', 'bg-background-dark text-on-background-dark')} style={style} {...rest}>
      <view  className={`${className} ${withTheme('pt-safe-top pb-safe-bottom ', 'pt-safe-top pb-safe-bottom')}`}>
        {children}
      </view>
    </page>
  );
};
