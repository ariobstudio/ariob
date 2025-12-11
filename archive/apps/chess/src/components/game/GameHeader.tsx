/**
 * Game Header Component
 *
 * Minimal header showing players, status, and actions
 * Board-focused design with only essential information
 */

import * as React from '@lynx-js/react';
import { Row, Column, Button, Icon, Badge, cn } from '@ariob/ui';
import type { IconProps } from '@ariob/ui';
import { PlayerChip } from './PlayerChip';
import type { Player } from '../../types';

export interface GameHeaderProps {
  // Players
  whitePlayerName: string;
  blackPlayerName: string;
  currentPlayer: Player;

  // User context
  myRole: 'player1' | 'player2' | 'spectator' | 'none';

  // Game state
  isWerera?: boolean;
  check?: Player | null;
  checkmate?: boolean;
  winner?: Player | null;

  // Actions
  onBack?: () => void;
  onHelp?: () => void;
  onMenu?: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  whitePlayerName,
  blackPlayerName,
  currentPlayer,
  myRole,
  isWerera = false,
  check = null,
  checkmate = false,
  winner = null,
  onBack,
  onHelp,
  onMenu,
}) => {
  const isSpectator = myRole === 'spectator';

  // Determine status message
  const statusMessage = (() => {
    if (checkmate && winner) {
      return winner === 'white' ? `${whitePlayerName} wins!` : `${blackPlayerName} wins!`;
    }
    if (check) {
      return 'Check!';
    }
    if (isSpectator) {
      return 'Spectating';
    }
    if (isWerera) {
      return 'Werera Phase';
    }
    return `${currentPlayer === 'white' ? whitePlayerName : blackPlayerName}'s turn`;
  })();

  const statusIcon: IconProps['name'] = (() => {
    if (checkmate) return 'trophy';
    if (check) return 'shield-alert';
    if (isWerera) return 'zap';
    return 'swords';
  })();

  return (
    <view className="border-b border-border/60 bg-background/95 px-5 pb-3">
      <Column spacing="md">
        <Row align="center" justify="between">
          <Row align="center" spacing="xs">
            {onBack && (
              <Button variant="ghost" size="icon" onTap={onBack}>
                <Icon name="arrow-left" size="sm" />
              </Button>
            )}
            <text className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Match
            </text>
          </Row>

          <Row spacing="xs" align="center">
            {onHelp && (
              <Button variant="ghost" size="icon" onTap={onHelp}>
                <Icon name="circle-question-mark" size="sm" />
              </Button>
            )}
            {onMenu && (
              <Button variant="ghost" size="icon" onTap={onMenu}>
                <Icon name="menu" size="sm" />
              </Button>
            )}
          </Row>
        </Row>

        <Row spacing="sm" align="center" justify="between" className="flex-wrap gap-y-2">
          <PlayerChip
            playerName={whitePlayerName}
            player="white"
            isActive={currentPlayer === 'white'}
            isYou={myRole === 'player1'}
          />

          <text className="text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
            vs
          </text>

          <PlayerChip
            playerName={blackPlayerName}
            player="black"
            isActive={currentPlayer === 'black'}
            isYou={myRole === 'player2'}
          />
        </Row>

        <view className="flex items-center justify-center">
          <Badge
            variant="outline"
            className={cn(
              'border-border/60 bg-transparent px-3 py-1 text-[11px] font-medium text-muted-foreground',
              checkmate && 'border-primary/60 text-primary',
              check && !checkmate && 'border-destructive/60 text-destructive'
            )}
          >
            <Row align="center" spacing="xs">
              <Icon name={statusIcon} size="sm" />
              <text>{statusMessage}</text>
            </Row>
          </Badge>
        </view>
      </Column>
    </view>
  );
};
