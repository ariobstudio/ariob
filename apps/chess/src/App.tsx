import * as React from '@lynx-js/react';
import { Row, Button, Icon, useTheme } from '@ariob/ui';
import { Board } from './components/Board';
import { HelpDialog } from './components/HelpDialog';
import { useChessGame } from './hooks/useChessGame';
import type { Position } from './types';

export function App() {
  const { withTheme } = useTheme();
  const [showHelp, setShowHelp] = React.useState(false);

  // Use custom hooks for clean state management
  const { gameState, handleSquarePress, handleNewGame, currentPlayerText } = useChessGame();

  return (
    <page className="w-full h-full bg-white">
      <view className="w-full h-full flex flex-col">
        {/* Clean minimal header with indigo accent */}
        <view
          className="px-4 py-3 pt-safe-top"
          style={{
            backgroundColor: '#4f46e5', // indigo-600
            borderBottom: '1px solid #4338ca', // indigo-700
          }}
        >
          <Row className="justify-between items-center">
            <view>
              <text
                className="text-2xl font-bold tracking-tight text-white"
              >
                Senterej
              </text>
              <text
                className="text-xs mt-0.5"
                style={{ color: '#e0e7ff' }} // indigo-100
              >
                {currentPlayerText} to move
              </text>
            </view>
            <Row className="gap-2">
              <Button
                onClick={() => setShowHelp(true)}
                variant="ghost"
                size="icon"
                style={{ backgroundColor: '#6366f1' }} // indigo-500
              >
                <Icon name="info" className="text-white" size="sm" />
              </Button>
              <Button
                onClick={handleNewGame}
                variant="default"
                icon={<Icon name="rotate-cw" className="text-indigo-500" size="sm" />}
                className="bg-white"
              >
                {/* <Icon name="plus" style={{ color: '#4f46e5' }} className="mr-1" size="sm" /> */}
                <text className="text-sm font-medium text-indigo-500">
                  New Game
                </text>
              </Button>
            </Row>
          </Row>
        </view>

        {/* Board container with clean minimal styling */}
        <view
          className="flex-1 w-full flex items-center justify-center p-4"
          style={{ backgroundColor: '#f9fafb' }} // gray-50
        >
          <view className="w-full" style={{ position: 'relative', paddingBottom: '100%' }}>
            <view
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(79, 70, 229, 0.15)',
              }}
            >
              <Board
                gameState={gameState}
                onSquarePress={handleSquarePress}
              />
            </view>
          </view>
        </view>

        {/* Clean status bar */}
        <view
          className="px-4 py-3 pb-safe-bottom min-h-16 flex items-center justify-center bg-white"
          style={{
            borderTop: '1px solid #e5e7eb', // gray-200
          }}
        >
          {gameState.check && !gameState.checkmate && (
            <Row className="gap-2 items-center">
              <Icon name="triangle-alert" style={{ color: '#f59e0b' }} size="sm" /> {/* amber-500 */}
              <text className="text-sm font-medium" style={{ color: '#b45309' }}> {/* amber-700 */}
                {gameState.check === 'green' ? 'White' : 'Black'} is in check
              </text>
            </Row>
          )}
          {gameState.checkmate && gameState.winner && (
            <Row className="gap-2 items-center">
              <Icon name="trophy" style={{ color: '#6366f1' }} size="lg" /> {/* indigo-500 */}
              <text className="text-base font-bold" style={{ color: '#4f46e5' }}> {/* indigo-600 */}
                {gameState.winner === 'green' ? 'White' : 'Black'} wins!
              </text>
            </Row>
          )}
          {!gameState.check && !gameState.checkmate && (
            <text className="text-xs text-center text-gray-500">
              Tap a piece to see available moves
            </text>
          )}
        </view>
      </view>

      {/* Help Dialog */}
      <HelpDialog gameState={gameState} isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </page>
  );
}
