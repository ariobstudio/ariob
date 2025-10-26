/**
 * DiscoveryBar
 *
 * Top navigation bar with search, degree indicator, and status.
 * Persistent across the feed view.
 */

import { Row, Text, Icon, Input, cn } from '@ariob/ui';
import type { Degree } from '@ariob/ripple';
import { DegreeIndicator } from './DegreeIndicator';

export interface DiscoveryBarProps {
  /** Current degree filter */
  degree: Degree;
  /** Degree change handler */
  onDegreeChange?: (degree: Degree) => void;
  /** Search handler */
  onSearchTap?: () => void;
  /** Settings handler */
  onSettingsTap?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * DiscoveryBar provides navigation and search at the top of the feed.
 * Shows degree filter and search button.
 */
export function DiscoveryBar({
  degree,
  onDegreeChange,
  onSearchTap,
  onSettingsTap,
  className,
}: DiscoveryBarProps) {
  const handleSearchTap = () => {
    'background only';
    console.log('[DiscoveryBar] Search tapped');
    onSearchTap?.();
  };

  const handleSettingsTap = () => {
    'background only';
    console.log('[DiscoveryBar] Settings tapped');
    onSettingsTap?.();
  };

  return (
    <view className={cn('w-full bg-background/95 backdrop-blur-sm border-b border-border transition-all duration-500', className)}>
      <Row className="items-center justify-between px-4 py-2.5 transition-all duration-500">
        {/* Left: Degree indicator */}
        <DegreeIndicator
          currentDegree={degree}
          onDegreeChange={onDegreeChange}
          compact={false}
        />

        {/* Right: Action buttons */}
        <Row className="items-center gap-2">
          {/* Search button */}
          <view
            className="w-10 h-10 flex items-center justify-center rounded-full bg-muted hover:bg-muted-foreground/10 transition-colors cursor-pointer"
            bindtap={handleSearchTap}
          >
            <Icon
              name="search"
              size="sm"
              className="text-foreground"
            />
          </view>

          {/* Settings button */}
          <view
            className="w-10 h-10 flex items-center justify-center rounded-full bg-muted hover:bg-muted-foreground/10 transition-colors cursor-pointer"
            bindtap={handleSettingsTap}
          >
            <Icon
              name="settings"
              size="sm"
              className="text-foreground"
            />
          </view>
        </Row>
      </Row>
    </view>
  );
}
