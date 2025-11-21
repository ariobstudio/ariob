import * as React from '@lynx-js/react';
import { createGame, makeMove, getPossibleMoves, positionsEqual } from '../engine';
import type { GameState, Position, Piece } from '../types';

export interface UseChessGameReturn {
  gameState: GameState;
  handleSquarePress: (position: Position) => void;
  handleMove: (from: Position, to: Position) => boolean;
  selectPiece: (position: Position) => boolean;
  deselectPiece: () => void;
  handleNewGame: () => void;
  currentPlayerText: string;
}

/**
 * Custom hook for managing chess game state and logic
 * Encapsulates all game rules, moves, and selection logic
 */
export function useChessGame(): UseChessGameReturn {
  const [gameState, setGameState] = React.useState<GameState>(() => createGame());

  /**
   * Select a piece and show its valid moves
   * Returns true if piece was selected, false otherwise
   */
  const selectPiece = React.useCallback((position: Position): boolean => {
    const piece = gameState.board[position.row][position.col];

    // Only allow selecting pieces of the current player
    if (!piece || piece.player !== gameState.currentPlayer) {
      return false;
    }

    const validMoves = getPossibleMoves(piece, gameState.board);

    setGameState(prev => ({
      ...prev,
      selectedSquare: position,
      validMoves,
    }));

    return true;
  }, [gameState.board, gameState.currentPlayer]);

  /**
   * Deselect the currently selected piece
   */
  const deselectPiece = React.useCallback(() => {
    setGameState(prev => ({
      ...prev,
      selectedSquare: null,
      validMoves: [],
    }));
  }, []);

  /**
   * Attempt to move a piece from one position to another
   * Returns true if move was successful, false otherwise
   */
  const handleMove = React.useCallback((from: Position, to: Position): boolean => {
    const newState = makeMove(gameState, from, to);

    if (newState) {
      setGameState(newState);
      return true;
    }

    return false;
  }, [gameState]);

  /**
   * Handle square press (tap) interaction
   * Supports both select-then-move and direct move patterns
   */
  const handleSquarePress = React.useCallback((position: Position) => {
    const clickedPiece = gameState.board[position.row][position.col];

    // If no square is selected
    if (gameState.selectedSquare === null) {
      // Try to select the clicked piece
      selectPiece(position);
      return;
    }

    // If clicking the same square, deselect
    if (positionsEqual(gameState.selectedSquare, position)) {
      deselectPiece();
      return;
    }

    // Try to make a move
    const moveSuccessful = handleMove(gameState.selectedSquare, position);

    if (!moveSuccessful) {
      // If move failed, try selecting a different piece
      if (clickedPiece && clickedPiece.player === gameState.currentPlayer) {
        selectPiece(position);
      } else {
        // Deselect if clicking empty square or opponent piece
        deselectPiece();
      }
    }
  }, [gameState, selectPiece, deselectPiece, handleMove]);

  /**
   * Start a new game
   */
  const handleNewGame = React.useCallback(() => {
    setGameState(createGame());
  }, []);

  /**
   * Get the current player name for display
   */
  const currentPlayerText = React.useMemo(
    () => (gameState.currentPlayer === 'white' ? 'White' : 'Black'),
    [gameState.currentPlayer]
  );

  return {
    gameState,
    handleSquarePress,
    handleMove,
    selectPiece,
    deselectPiece,
    handleNewGame,
    currentPlayerText,
  };
}
