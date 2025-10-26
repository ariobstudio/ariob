/**
 * DegreeIndicator
 *
 * Visual indicator and selector for degree filtering (0°-2°).
 * Shows current degree with color temperature hints.
 */

import { Row, Text, Button, cn } from '@ariob/ui';
import type { Degree } from '@ariob/ripple';

export interface DegreeIndicatorProps {
  /** Current active degree */
  currentDegree: Degree;
  /** Degree change handler */
  onDegreeChange?: (degree: Degree) => void;
  /** Compact mode (smaller) */
  compact?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Degree labels and colors
 */
const DEGREE_CONFIG: Record<Degree, { label: string; color: string; tempClass: string }> = {
  '0': {
    label: 'Me',
    color: 'text-orange-500',
    tempClass: 'bg-orange-50 dark:bg-orange-950/20', // Warm
  },
  '1': {
    label: 'Friends',
    color: 'text-primary',
    tempClass: 'bg-background', // Neutral
  },
  '2': {
    label: 'Extended',
    color: 'text-blue-500',
    tempClass: 'bg-blue-50 dark:bg-blue-950/20', // Cool
  },
};

/**
 * DegreeIndicator shows the current degree and allows switching.
 * Visual temperature changes (warm → neutral → cool) reinforce distance.
 */
export function DegreeIndicator({
  currentDegree,
  onDegreeChange,
  compact = false,
  className,
}: DegreeIndicatorProps) {
  const config = DEGREE_CONFIG[currentDegree];

  const handleTap = () => {
    'background only';
    if (!onDegreeChange) return;

    // Cycle through degrees: 0 -> 1 -> 2 -> 0
    const degrees: Degree[] = ['0', '1', '2'];
    const currentIndex = degrees.indexOf(currentDegree);
    const nextIndex = (currentIndex + 1) % degrees.length;
    onDegreeChange(degrees[nextIndex]);
  };

  return (
    <view
      className={cn('px-3 py-1.5 rounded-full border transition-colors cursor-pointer', config.tempClass, className)}
      bindtap={handleTap}
    >
      <Row className="items-center gap-1.5">
        <Text size={compact ? 'xs' : 'sm'} weight="semibold" className={config.color}>
          {currentDegree}°
        </Text>
        {!compact && (
          <Text size="sm" variant="muted">
            {config.label}
          </Text>
        )}
      </Row>
    </view>
  );
}
