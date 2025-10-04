import { Icon, lucideGlyphs } from '@ariob/ui';

type LucideName = keyof typeof lucideGlyphs;

interface StatusBadgeProps {
  label: string;
  icon: LucideName;
  variant?: 'default' | 'loading' | 'success' | 'warning' | 'error';
  animated?: boolean;
}

export function StatusBadge({
  label,
  icon,
  variant = 'default',
  animated = false
}: StatusBadgeProps) {
  const badgeClass = {
    default: 'bg-muted border border-border',
    loading: 'bg-accent border border-accent',
    success: 'bg-primary border border-primary',
    warning: 'bg-secondary border border-secondary',
    error: 'bg-destructive border border-destructive',
  }[variant];

  const textClass = {
    default: 'text-muted-foreground',
    loading: 'text-accent-foreground',
    success: 'text-primary-foreground',
    warning: 'text-secondary-foreground',
    error: 'text-destructive-foreground',
  }[variant];

  return (
    <view className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 ${badgeClass}`}>
      <Icon
        name={icon}
        className={`text-xs ${textClass}`}
        style={animated ? { animation: 'spin 1s linear infinite' } : undefined}
      />
      <text className={`text-xs font-medium ${textClass}`}>{label}</text>
    </view>
  );
}
