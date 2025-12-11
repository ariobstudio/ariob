import * as React from '@lynx-js/react';
import { Column, Row, Icon, Sheet, SheetContent, SheetHeader, SheetTitle, SheetBody, cn } from '@ariob/ui';
import type { GameState, PieceType, Piece } from '../types';
import { PieceMovementCard } from './PieceMovementCard';
import { getPieceImage } from '../utils/pieceImages';

interface HelpDialogProps {
  gameState: GameState;
  isOpen: boolean;
  onClose: () => void;
}

// Piece data for carousel (constant)
const PIECE_DATA = [
  { type: 'negus' as PieceType, name: 'Negus (King)', description: '1 square in any direction' },
  { type: 'fers' as PieceType, name: 'Fers (Minister)', description: '1 square diagonally' },
  { type: 'saba' as PieceType, name: 'Saba (Elephant)', description: 'Jumps 2 squares diagonally' },
  { type: 'ferese' as PieceType, name: 'Ferese (Knight)', description: 'L-shape moves' },
  { type: 'der' as PieceType, name: 'Der (Rook)', description: 'Any distance horizontal/vertical' },
  { type: 'medeq' as PieceType, name: 'Medeq (Pawn)', description: '1 forward, captures diagonally' },
];

// Helper to group captured pieces by type with counts
const groupCapturedPieces = (pieces: Piece[]): { type: PieceType; count: number }[] => {
  const grouped = new Map<PieceType, number>();
  pieces.forEach((piece) => {
    grouped.set(piece.type, (grouped.get(piece.type) || 0) + 1);
  });
  return Array.from(grouped.entries()).map(([type, count]) => ({ type, count }));
};

export const HelpDialog: React.FC<HelpDialogProps> = ({ gameState, isOpen, onClose }) => {
  const currentPlayerText = gameState.currentPlayer === 'white' ? 'White' : 'Black';

  // Group captured pieces by type - memoize to prevent re-computation
  const whiteCaptured = React.useMemo(
    () => groupCapturedPieces(gameState.capturedPieces.white),
    [gameState.capturedPieces.white]
  );
  const blackCaptured = React.useMemo(
    () => groupCapturedPieces(gameState.capturedPieces.black),
    [gameState.capturedPieces.black]
  );

  const handleOpenChange = React.useCallback((open: boolean) => {
    if (!open) {
      onClose();
    }
  }, [onClose]);

  // Empty handler for catch events - they prevent bubbling automatically
  const preventBubble = React.useCallback(() => {
    // catch* events prevent bubbling automatically, no need for stopPropagation
  }, []);

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>Game Info</SheetTitle>
        </SheetHeader>

        <SheetBody
          className="pb-safe-bottom"
          catchtouchstart={preventBubble}
          catchtouchmove={preventBubble}
          catchtouchend={preventBubble}
        >
          <Column className="gap-6">
            {/* Current Turn */}
            <view className="rounded-xl border border-primary/30 bg-primary/10 p-4">
              <Row className="gap-2 items-center">
                <view
                  className={cn(
                    'w-3 h-3 rounded-full border-2 border-primary',
                    gameState.currentPlayer === 'white' ? 'bg-card' : 'bg-foreground'
                  )}
                />
                <Column>
                  <text className="text-xs text-muted-foreground">Current Turn</text>
                  <text className="text-lg font-bold text-primary">
                    {currentPlayerText}
                  </text>
                </Column>
              </Row>
            </view>

            {/* Check/Checkmate */}
            {gameState.check && !gameState.checkmate && (
              <view className="rounded-xl border border-destructive/40 bg-destructive/10 p-4">
                <Row className="gap-3 items-center">
                  <Icon name="triangle-alert" className="text-destructive" />
                  <text className="text-sm font-medium text-destructive">
                    {gameState.check === 'white' ? 'White' : 'Black'} King is in check!
                  </text>
                </Row>
              </view>
            )}

            {gameState.checkmate && gameState.winner && (
              <view className="rounded-xl border border-primary/40 bg-primary/10 p-4">
                <Row className="gap-3 items-center">
                  <Icon name="trophy" className="text-primary" />
                  <text className="text-sm font-bold text-primary">
                    {gameState.winner === 'white' ? 'White' : 'Black'} wins by checkmate!
                  </text>
                </Row>
              </view>
            )}

            {/* Captured Pieces */}
            <view className="rounded-xl border border-border bg-card p-4">
              <text className="text-sm font-semibold text-foreground mb-3">
                Captured Pieces
              </text>
              <Column className="gap-3">
                {/* White's Captures */}
                <view>
                  <text className="text-xs text-muted-foreground mb-2">White captured:</text>
                  {whiteCaptured.length === 0 ? (
                    <text className="text-sm text-muted-foreground">None</text>
                  ) : (
                    <Row className="gap-2 flex-wrap">
                      {whiteCaptured.map(({ type, count }) => (
                        <view
                          key={type}
                          className="rounded-lg p-2 border border-border bg-card"
                          style={{ minWidth: 48 }}
                        >
                          <view className="relative">
                            <image
                              src={getPieceImage(type, 'black')}
                              auto-size={true}
                              mode="aspectFit"
                              style={{ width: '32px', height: '32px' }}
                            />
                            <view
                              className="absolute -top-1 -right-1 rounded-full px-1.5 py-0.5 bg-primary"
                              style={{ minWidth: 20 }}
                            >
                              <text className="text-xs font-bold text-primary-foreground text-center">
                                {count}
                              </text>
                            </view>
                          </view>
                        </view>
                      ))}
                    </Row>
                  )}
                </view>

                {/* Black's Captures */}
                <view>
                  <text className="text-xs text-muted-foreground mb-2">Black captured:</text>
                  {blackCaptured.length === 0 ? (
                    <text className="text-sm text-muted-foreground">None</text>
                  ) : (
                    <Row className="gap-2 flex-wrap">
                      {blackCaptured.map(({ type, count }) => (
                        <view
                          key={type}
                          className="rounded-lg p-2 border border-border bg-card"
                          style={{ minWidth: 48 }}
                        >
                          <view className="relative">
                            <image
                              src={getPieceImage(type, 'white')}
                              auto-size={true}
                              mode="aspectFit"
                              style={{ width: '32px', height: '32px' }}
                            />
                            <view
                              className="absolute -top-1 -right-1 rounded-full px-1.5 py-0.5 bg-primary"
                              style={{ minWidth: 20 }}
                            >
                              <text className="text-xs font-bold text-primary-foreground text-center">
                                {count}
                              </text>
                            </view>
                          </view>
                        </view>
                      ))}
                    </Row>
                  )}
                </view>
              </Column>
            </view>

            {/* Piece Movements Carousel */}
            <view>
              <text className="text-base font-semibold text-foreground mb-3">
                Piece Movements
              </text>
              <text className="text-xs text-muted-foreground mb-4">
                Swipe to see how each piece moves
              </text>

              <view style={{ marginLeft: '-16px', marginRight: '-16px' }}>
                <scroll-view
                  scroll-x={true}
                  className="scrollbar-hide"
                  style={{
                    scrollSnapType: 'x mandatory',
                    WebkitOverflowScrolling: 'touch',
                  }}
                >
                  <Row className="gap-0" style={{ paddingLeft: 16, paddingRight: 16 }}>
                    {PIECE_DATA.map((piece) => (
                      <view
                        key={piece.type}
                        style={{ scrollSnapAlign: 'start' }}
                      >
                        <PieceMovementCard
                          pieceType={piece.type}
                          name={piece.name}
                          description={piece.description}
                        />
                      </view>
                    ))}
                  </Row>
                </scroll-view>
              </view>

              {/* Pagination dots indicator */}
              <Row className="gap-1.5 justify-center mt-3">
                {PIECE_DATA.map((_, index) => (
                  <view
                    key={index}
                    className={cn(
                      'w-1.5 h-1.5 rounded-full',
                      index === 0 ? 'bg-primary' : 'bg-muted'
                    )}
                  />
                ))}
              </Row>
            </view>
          </Column>
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
};
