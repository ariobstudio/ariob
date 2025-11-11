/**
 * Game Feature
 *
 * Main game screen with real-time multiplayer using Gun.
 * Integrates session management, Werera phase, and game logic.
 */

import { useState, useCallback, useEffect } from '@lynx-js/react';
import { Button, Card, Column, Spinner, Sheet, SheetContent } from '@ariob/ui';
import type { IGunChainReference } from '@ariob/core';
import type { NavigatorInstance } from '../components/Navigation';
import type { Position, GameState } from '../types';

import { Board, GameOverDialog, MoveHistory } from '../components';
import { GameHeader, GameFooter } from '../components/game';
import { HelpDialog } from '../components/HelpDialog';
import { useGameSession } from './hooks/useGameSession';
import { useWerera } from './hooks/useWerera';
import { useGameLogic } from './hooks/useGameLogic';
import { useSettings } from '../store/settings';

export interface GameFeatureProps {
  data?: {
    sessionId: string;
    joining?: boolean;
    isCreator?: boolean;
  };
  navigator?: NavigatorInstance;
  graph: IGunChainReference;
}

/**
 * Game feature component
 */
export function GameFeature({ data, navigator, graph }: GameFeatureProps) {
  const { sessionId, joining, isCreator } = data || {};

  if (!sessionId) {
    return (
      <view className="w-full h-full flex items-center justify-center">
        <text className="text-red-500">Error: No session ID provided</text>
      </view>
    );
  }

  // Session management
  const {
    session,
    moves,
    loading,
    error,
    addMove,
    updateSession,
    myRole,
  } = useGameSession({
    sessionId,
    graph,
    joining,
    isCreator,
  });

  // Werera phase logic
  const {
    isWerera,
    canMove,
    makeMove,
    processedMoves,
    myPlayer,
  } = useWerera({
    session,
    moves,
    addMove,
    updateSession,
    myRole,
  });

  // Game logic (board state)
  const { gameState, getValidMoves, isValidMove } = useGameLogic({
    processedMoves,
    myPlayer,
    variant: session?.variant || 'senterej', // Default to Senterej for backwards compatibility
  });

  // Watch for theme changes
  const boardTheme = useSettings((state) => state.boardTheme);
  const showCapturedPieces = useSettings((state) => state.showCapturedPieces);
  useEffect(() => {
    'background only';
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', boardTheme);
      console.log('[Game] Applied theme:', boardTheme);
    }
  }, [boardTheme]);

  // UI state
  const [selectedSquare, setSelectedSquare] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [historySheetOpen, setHistorySheetOpen] = useState(false);
  const [menuSheetOpen, setMenuSheetOpen] = useState(false);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);

  /**
   * Handle square press
   */
  const handleSquarePress = useCallback((position: Position) => {
    'background only';

    const piece = gameState.board[position.row][position.col];

    // If no square selected
    if (!selectedSquare) {
      // Try to select piece
      if (piece && piece.player === myPlayer) {
        setSelectedSquare(position);
        setValidMoves(getValidMoves(position));
      }
      return;
    }

    // If clicking same square, deselect
    if (selectedSquare.row === position.row && selectedSquare.col === position.col) {
      setSelectedSquare(null);
      setValidMoves([]);
      return;
    }

    // Try to move
    if (isValidMove(selectedSquare, position)) {
      const selectedPiece = gameState.board[selectedSquare.row][selectedSquare.col];
      if (selectedPiece) {
        const targetPiece = gameState.board[position.row][position.col];
        const captured = targetPiece !== null;

        makeMove(selectedSquare, position, captured, selectedPiece.type);
      }

      setSelectedSquare(null);
      setValidMoves([]);
    } else {
      // Try selecting different piece
      if (piece && piece.player === myPlayer) {
        setSelectedSquare(position);
        setValidMoves(getValidMoves(position));
      } else {
        setSelectedSquare(null);
        setValidMoves([]);
      }
    }
  }, [selectedSquare, gameState, myPlayer, getValidMoves, isValidMove, makeMove]);

  /**
   * Go back to lobby
   */
  const handleBackToLobby = () => {
    'background only';
    if (navigator) {
      navigator.goBack();
    }
  };


  /**
   * Handle rematch request
   * Creates a new game session with the same players
   */
  const handleRematch = useCallback(() => {
    'background only';

    // TODO: Implement rematch functionality
    // This should create a new session with the same players
    console.log('[GameFeature] Rematch requested');

    alert('Rematch functionality coming soon!\nFor now, return to lobby to start a new game.');
  }, []);

  // Debug logging
  console.log('[GameFeature] State:', { loading, hasSession: !!session, sessionId, myRole });

  // Loading state
  if (loading || !session) {
    return (
      <view className="flex items-center justify-center w-full h-full">
        <Spinner size="xl" color="default" />
      </view>
    );
  }

  // Error state
  if (error) {
    return (
      <view className="w-full h-full flex items-center justify-center bg-gray-50">
        <view className="text-center">
          <text className="mb-2 text-destructive">Error loading game</text>
          <Button onTap={handleBackToLobby}>Back to Lobby</Button>
        </view>
      </view>
    );
  }

  // Player names
  const whitePlayerName = session.player1Alias || 'White';
  const blackPlayerName = session.player2Alias || 'Waiting for Opponent';

  // Flags
  const hasMoves = moves.length > 0;

  return (
    <Column height="screen" spacing="none" className="bg-background text-foreground">
      <GameHeader
        whitePlayerName={whitePlayerName}
        blackPlayerName={blackPlayerName}
        currentPlayer={gameState.currentPlayer}
        myRole={myRole}
        isWerera={isWerera}
        check={gameState.check}
        checkmate={gameState.checkmate}
        winner={gameState.winner}
        onBack={handleBackToLobby}
        onHelp={() => setHelpDialogOpen(true)}
        onMenu={() => setMenuSheetOpen(true)}
      />

      <Column spacing="lg" className="flex-1 px-5 pb-safe-bottom pt-5">
        <view className="flex flex-1 items-center justify-center">
          <Card
            radius="lg"
            className="mx-auto flex h-full w-full max-w-3xl items-center justify-center gap-0 border-border bg-card px-0 py-0"
            style={{
              aspectRatio: '1 / 1',
              maxWidth: 'min(92vw, 80vh)',
            }}
          >
            <Board
              gameState={{
                ...gameState,
                selectedSquare,
                validMoves,
              }}
              onSquarePress={handleSquarePress}
            />
          </Card>
        </view>
      </Column>

      <GameFooter
        onHistory={() => setHistorySheetOpen(true)}
        onMenu={() => setMenuSheetOpen(true)}
        onHelp={() => setHelpDialogOpen(true)}
        hasMoves={hasMoves}
      />

      {/* History Sheet */}
      <Sheet open={historySheetOpen} onOpenChange={setHistorySheetOpen}>
        <SheetContent side="bottom">
          <view className="px-5 py-4">
            <text className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Move History
            </text>
            {hasMoves ? (
              <MoveHistory moves={moves} maxHeight="400px" />
            ) : (
              <view className="py-6">
                <text className="text-xs text-muted-foreground text-center">
                  Moves will appear once the game starts.
                </text>
              </view>
            )}
          </view>
        </SheetContent>
      </Sheet>

      {/* Menu Sheet */}
      <Sheet open={menuSheetOpen} onOpenChange={setMenuSheetOpen}>
        <SheetContent side="bottom">
          <view className="px-5 py-4">
            <text className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Game Menu
            </text>
            <view className="flex flex-col gap-3">
              <Button
                variant="secondary"
                onTap={() => {
                  setMenuSheetOpen(false);
                  setHelpDialogOpen(true);
                }}
              >
                Help & Rules
              </Button>
              <Button
                variant="secondary"
                onTap={() => {
                  setMenuSheetOpen(false);
                  handleBackToLobby();
                }}
              >
                Return to Lobby
              </Button>
            </view>
          </view>
        </SheetContent>
      </Sheet>

      {/* Help Dialog */}
      <HelpDialog
        gameState={gameState}
        isOpen={helpDialogOpen}
        onClose={() => setHelpDialogOpen(false)}
      />

      {/* Game Over Dialog */}
      <GameOverDialog
        open={gameState.checkmate}
        onOpenChange={() => {}}
        winner={gameState.winner}
        reason={gameState.checkmate ? 'checkmate' : null}
        winnerName={
          gameState.winner === 'white'
            ? session?.player1Alias
            : gameState.winner === 'black'
            ? session?.player2Alias
            : undefined
        }
        loserName={
          gameState.winner === 'white'
            ? session?.player2Alias
            : gameState.winner === 'black'
            ? session?.player1Alias
            : undefined
        }
        fen={gameState.fen}
        onRematch={handleRematch}
        onReturnToLobby={handleBackToLobby}
        canRematch={myRole !== 'spectator'}
      />
    </Column>
  );
}
