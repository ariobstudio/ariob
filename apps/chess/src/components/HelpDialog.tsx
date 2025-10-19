import * as React from '@lynx-js/react';
import { Column, Row, Icon, Sheet, SheetContent, SheetHeader, SheetTitle, SheetBody } from '@ariob/ui';
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
  const currentPlayerText = gameState.currentPlayer === 'green' ? 'White' : 'Black';

  // Group captured pieces by type - memoize to prevent re-computation
  const greenCaptured = React.useMemo(
    () => groupCapturedPieces(gameState.capturedPieces.green),
    [gameState.capturedPieces.green]
  );
  const goldCaptured = React.useMemo(
    () => groupCapturedPieces(gameState.capturedPieces.gold),
    [gameState.capturedPieces.gold]
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
            <view
              className="rounded-xl p-4"
              style={{
                backgroundColor: '#c7d2fe', // indigo-200 - matches light board squares
                border: '2px solid #a5b4fc', // indigo-300
              }}
            >
              <Row className="gap-2 items-center">
                <view
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: gameState.currentPlayer === 'green' ? '#ffffff' : '#000000',
                    border: '2px solid #4f46e5',
                  }}
                />
                <Column>
                  <text className="text-xs text-gray-600">Current Turn</text>
                  <text className="text-lg font-bold" style={{ color: '#4f46e5' }}> {/* indigo-600 */}
                    {currentPlayerText}
                  </text>
                </Column>
              </Row>
            </view>

            {/* Check/Checkmate */}
            {gameState.check && !gameState.checkmate && (
              <view
                className="rounded-xl p-4"
                style={{
                  backgroundColor: '#fffbeb', // amber-50
                  border: '2px solid #fde68a', // amber-200
                }}
              >
                <Row className="gap-3 items-center">
                  <Icon name="triangle-alert" style={{ color: '#f59e0b' }} /> {/* amber-500 */}
                  <text className="text-sm font-medium" style={{ color: '#b45309' }}> {/* amber-700 */}
                    {gameState.check === 'green' ? 'White' : 'Black'} King is in check!
                  </text>
                </Row>
              </view>
            )}

            {gameState.checkmate && gameState.winner && (
              <view
                className="rounded-xl p-4"
                style={{
                  backgroundColor: '#818cf8', // indigo-400 - matches dark board squares
                  border: '2px solid #6366f1', // indigo-500
                }}
              >
                <Row className="gap-3 items-center">
                  <Icon name="trophy" style={{ color: '#ffffff' }} />
                  <text className="text-sm font-bold text-white">
                    {gameState.winner === 'green' ? 'White' : 'Black'} wins by checkmate!
                  </text>
                </Row>
              </view>
            )}

            {/* Captured Pieces */}
            <view
              className="rounded-xl p-4"
              style={{
                backgroundColor: '#f9fafb', // gray-50
                border: '1px solid #e5e7eb', // gray-200
              }}
            >
              <text className="text-sm font-semibold text-gray-900 mb-3">
                Captured Pieces
              </text>
              <Column className="gap-3">
                {/* White's Captures */}
                <view>
                  <text className="text-xs text-gray-600 mb-2">White captured:</text>
                  {greenCaptured.length === 0 ? (
                    <text className="text-sm text-gray-400">None</text>
                  ) : (
                    <Row className="gap-2 flex-wrap">
                      {greenCaptured.map(({ type, count }) => (
                        <view
                          key={type}
                          className="rounded-lg p-2"
                          style={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #e5e7eb',
                            minWidth: 48,
                          }}
                        >
                          <view className="relative">
                            <image
                              src={getPieceImage(type, 'gold')}
                              auto-size={true}
                              mode="aspectFit"
                              style={{ width: 32, height: 32 }}
                            />
                            <view
                              className="absolute -top-1 -right-1 rounded-full px-1.5 py-0.5"
                              style={{
                                backgroundColor: '#4f46e5', // indigo-600
                                minWidth: 20,
                              }}
                            >
                              <text className="text-xs font-bold text-white text-center">
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
                  <text className="text-xs text-gray-600 mb-2">Black captured:</text>
                  {goldCaptured.length === 0 ? (
                    <text className="text-sm text-gray-400">None</text>
                  ) : (
                    <Row className="gap-2 flex-wrap">
                      {goldCaptured.map(({ type, count }) => (
                        <view
                          key={type}
                          className="rounded-lg p-2"
                          style={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #e5e7eb',
                            minWidth: 48,
                          }}
                        >
                          <view className="relative">
                            <image
                              src={getPieceImage(type, 'green')}
                              auto-size={true}
                              mode="aspectFit"
                              style={{ width: 32, height: 32 }}
                            />
                            <view
                              className="absolute -top-1 -right-1 rounded-full px-1.5 py-0.5"
                              style={{
                                backgroundColor: '#4f46e5', // indigo-600
                                minWidth: 20,
                              }}
                            >
                              <text className="text-xs font-bold text-white text-center">
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
              <text className="text-base font-semibold text-gray-900 mb-3">
                Piece Movements
              </text>
              <text className="text-xs text-gray-600 mb-4">
                Swipe to see how each piece moves
              </text>

              <view style={{ marginLeft: -16, marginRight: -16 }}>
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
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      backgroundColor: index === 0 ? '#4f46e5' : '#d1d5db', // indigo-600 : gray-300
                    }}
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
