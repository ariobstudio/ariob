/**
 * Player Chip Component
 *
 * Compact player indicator with color dot and active state
 */

import * as React from '@lynx-js/react';
import { Row, cn } from '@ariob/ui';
import type { Player } from '../../types';

export interface PlayerChipProps {
  playerName: string;
  player: Player;
  isActive?: boolean;
  isYou?: boolean;
}

export const PlayerChip: React.FC<PlayerChipProps> = ({
  playerName,
  player,
  isActive = false,
  isYou = false,
}) => {
  return (
    <Row
      spacing="xs"
      align="center"
      className={cn(
        'rounded-full border border-border/60 bg-background/85 px-3 py-1',
        isActive && 'border-primary/60 bg-primary/10'
      )}
    >
      <view
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '9999px',
          backgroundColor: player === 'white' ? '#ffffff' : '#000000',
          border: player === 'white' ? '1px solid rgba(15, 23, 42, 0.08)' : 'none',
        }}
      />

      <text className="text-xs font-medium text-foreground">
        {playerName}
        {isYou && ' · You'}
      </text>
    </Row>
  );
};
