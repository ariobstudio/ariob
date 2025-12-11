/**
 * Game Over Dialog Component
 *
 * Displays game result and provides options to:
 * - See winner and game-ending condition
 * - Request rematch (creates new session with same players)
 * - Return to lobby
 * - View final FEN position
 */

import { useState } from '@lynx-js/react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetBody,
  Button,
  Icon,
  Column,
  Row,
  Badge,
  cn,
} from '@ariob/ui';
import type { Player } from '../types';

export interface GameOverDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  winner: Player | null;
  reason: 'checkmate' | 'stalemate' | 'resignation' | 'timeout' | 'bare-king' | null;
  winnerName?: string;
  loserName?: string;
  currentPlayerName?: string;
  fen?: string;
  onRematch?: () => void;
  onReturnToLobby: () => void;
  canRematch?: boolean;
}

/**
 * Get game over message based on result
 */
function getGameOverMessage(
  winner: Player | null,
  reason: string | null,
  winnerName?: string,
  loserName?: string,
  currentPlayerName?: string
): { title: string; subtitle: string; icon: string; iconClass: string } {
  if (!reason) {
    return {
      title: 'Game Over',
      subtitle: 'The game has ended',
      icon: 'circle',
      iconClass: 'text-muted-foreground',
    };
  }

  switch (reason) {
    case 'checkmate':
      return {
        title: winner ? `${winnerName || 'You'} Won!` : 'Checkmate',
        subtitle: `Victory by checkmate`,
        icon: 'trophy',
        iconClass: 'text-primary',
      };

    case 'stalemate':
      return {
        title: 'Stalemate',
        subtitle: `${loserName || currentPlayerName || 'The player'} has no legal moves`,
        icon: 'equal',
        iconClass: 'text-muted-foreground',
      };

    case 'bare-king':
      return {
        title: winner ? `${winnerName || 'You'} Won!` : 'Bare King',
        subtitle: `${loserName || 'Opponent'} left with only the king`,
        icon: 'crown',
        iconClass: 'text-primary',
      };

    case 'resignation':
      return {
        title: winner ? `${winnerName || 'You'} Won!` : 'Resignation',
        subtitle: `${loserName || 'Opponent'} resigned`,
        icon: 'flag',
        iconClass: 'text-primary',
      };

    case 'timeout':
      return {
        title: winner ? `${winnerName || 'You'} Won!` : 'Time Out',
        subtitle: `${loserName || 'Opponent'} ran out of time`,
        icon: 'clock',
        iconClass: 'text-primary',
      };

    default:
      return {
        title: 'Game Over',
        subtitle: 'The game has ended',
        icon: 'circle',
        iconClass: 'text-muted-foreground',
      };
  }
}

/**
 * Game Over Dialog Component
 */
export function GameOverDialog({
  open,
  onOpenChange,
  winner,
  reason,
  winnerName,
  loserName,
  currentPlayerName,
  fen,
  onRematch,
  onReturnToLobby,
  canRematch = true,
}: GameOverDialogProps) {
  const [showFEN, setShowFEN] = useState(false);
  const [fenCopied, setFenCopied] = useState(false);

  const message = getGameOverMessage(winner, reason, winnerName, loserName, currentPlayerName);

  /**
   * Handle FEN copy
   */
  const handleCopyFEN = () => {
    'background only';

    // Note: Native clipboard not available in LynxJS yet
    setFenCopied(true);
    setTimeout(() => setFenCopied(false), 2000);

    console.log('[GameOver] Copied FEN:', fen);
  };

  /**
   * Handle rematch request
   */
  const handleRematch = () => {
    'background only';

    if (onRematch) {
      onRematch();
      onOpenChange(false);
    }
  };

  /**
   * Handle return to lobby
   */
  const handleReturnToLobby = () => {
    'background only';
    onReturnToLobby();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom">
        <SheetHeader showClose={false}>
          <view className="w-full flex items-center justify-center">
            <view
              className={cn(
                'w-20 h-20 rounded-full flex items-center justify-center mb-4',
                winner ? 'bg-primary/10' : 'bg-muted'
              )}
            >
              <Icon name={message.icon as any} size="lg" className={message.iconClass} />
            </view>
          </view>
          <SheetTitle className="text-center">{message.title}</SheetTitle>
        </SheetHeader>

        <SheetBody>
          <Column className="gap-6 py-2">
            {/* Result Message */}
            <view className="text-center">
              <text className="text-base text-muted-foreground">
                {message.subtitle}
              </text>
            </view>

            {/* Game Details */}
            {reason && (
              <view className="bg-accent rounded-lg p-4">
                <Column className="gap-2">
                  <Row className="justify-between items-center">
                    <text className="text-sm text-muted-foreground">Result</text>
                    <Badge variant={winner ? 'default' : 'outline'}>
                      {reason === 'checkmate'
                        ? 'Checkmate'
                        : reason === 'stalemate'
                        ? 'Stalemate'
                        : reason === 'bare-king'
                        ? 'Bare King'
                        : reason === 'resignation'
                        ? 'Resignation'
                        : reason === 'timeout'
                        ? 'Time Out'
                        : 'Game Over'}
                    </Badge>
                  </Row>

                  {winner && winnerName && (
                    <Row className="justify-between items-center">
                      <text className="text-sm text-muted-foreground">Winner</text>
                      <text className="text-sm font-semibold">{winnerName}</text>
                    </Row>
                  )}
                </Column>
              </view>
            )}

            {/* FEN Export (optional) */}
            {fen && (
              <view>
                <Button
                  variant="outline"
                  size="sm"
                  onTap={() => setShowFEN(!showFEN)}
                  className="w-full"
                  icon={
                    <Icon
                      name={showFEN ? 'chevron-up' : 'chevron-down'}
                      size="sm"
                    />
                  }
                >
                  {showFEN ? 'Hide' : 'Show'} Final Position (FEN)
                </Button>

                {showFEN && (
                  <view className="mt-3 bg-muted rounded-lg p-3">
                    <text
                      className="text-xs font-mono break-all"
                      style={{ wordBreak: 'break-all', lineHeight: '1.5' }}
                    >
                      {fen}
                    </text>
                    <Button
                      variant="ghost"
                      size="sm"
                      onTap={handleCopyFEN}
                      className="w-full mt-2"
                      icon={
                        <Icon
                          name={fenCopied ? 'check' : 'copy'}
                          size="sm"
                        />
                      }
                    >
                      {fenCopied ? 'Copied!' : 'Copy FEN'}
                    </Button>
                  </view>
                )}
              </view>
            )}

            {/* Action Buttons */}
            <Column className="gap-3 pt-2">
              {canRematch && onRematch && (
                <Button
                  onTap={handleRematch}
                  size="lg"
                  className="w-full"
                  icon={<Icon name="rotate-cw" className="text-primary-foreground" />}
                >
                  Play Again
                </Button>
              )}

              <Button
                onTap={handleReturnToLobby}
                variant={canRematch ? 'outline' : 'default'}
                size="lg"
                className="w-full"
                icon={<Icon name="arrow-left" />}
              >
                Return to Lobby
              </Button>
            </Column>
          </Column>
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}
