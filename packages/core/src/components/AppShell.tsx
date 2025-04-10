import React from 'react';
import { Layout } from './Layout';
import { Header } from './Header';
import { PageHeader } from './PageHeader';

type AppShellProps = {
  children: React.ReactNode;
  title?: string;
  description?: string;
  titleActions?: React.ReactNode;
  hideHeader?: boolean;
  hideTitle?: boolean;
  centerContent?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'none';
  className?: string;
  headerProps?: Partial<React.ComponentProps<typeof Header>>;
  theme?: 'light' | 'dark';
};

/**
 * AppShell is a higher-level component that provides a consistent
 * application layout with header, title and content sections.
 */
export function AppShell({
  children,
  title,
  description,
  titleActions,
  hideHeader = false,
  hideTitle = false,
  centerContent = true,
  maxWidth = 'xl',
  className = '',
  headerProps = {},
  theme = 'light'
}: AppShellProps) {
  // Map maxWidth to pixel values
  const getMaxWidth = () => {
    switch (maxWidth) {
      case 'sm': return '640px';
      case 'md': return '768px';
      case 'lg': return '1024px';
      case 'xl': return '1280px';
      case '2xl': return '1536px';
      case 'full': return '100%';
      case 'none': return 'none';
      default: return '1280px'; // Default to xl
    }
  };

  return (
    <Layout 
      header={!hideHeader ? <Header {...headerProps} /> : undefined}
      className={`theme-${theme} bg-background text-on-background min-h-screen ${className}`}
    >
      <view 
        className="flex flex-col"
        style={{ 
          alignItems: centerContent ? 'center' : 'flex-start',
          paddingTop: 'var(--space-4)', 
          paddingBottom: 'var(--space-8)'
        }}
      >
        <view 
          style={{
            width: '100%',
            maxWidth: getMaxWidth(),
            padding: '0 var(--space-4)',
          }}
        >
          {!hideTitle && title && (
            <PageHeader 
              title={title} 
              description={description}
              actions={titleActions}
            />
          )}
          
          {children}
        </view>
      </view>
    </Layout>
  );
} 