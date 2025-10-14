import * as React from '@lynx-js/react';
import {
  Column,
  Row,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Alert,
  AlertTitle,
  AlertDescription,
} from '@ariob/ui';
import { Board, GameInfo, MoveHistory } from '@ariob/senterej/ui';
import { getValidMoves } from '@ariob/senterej/engine';
import type { Position } from '@ariob/senterej/engine';
import { useGameSession } from '@ariob/senterej/p2p';
import { useGraph } from '../GraphContext';

interface GameScreenProps {
  sessionId: string;
  onLeave: () => void;
}

export function GameScreen({ sessionId, onLeave }: GameScreenProps) {
  const graph = useGraph();
  const { session, makeMove, leaveGame, localPlayer, error } = useGameSession({
    graph,
    sessionId,
    playerName: 'Player',
  });

  const [selectedSquare, setSelectedSquare] = React.useState<Position | undefined>();
  const [validMoves, setValidMoves] = React.useState<Position[]>([]);

  const handleSquarePress = async (position: Position) => {
    if (!session) return;

    const gameState = session.state;
    const piece = gameState.board[position.row][position.col];

    // If no piece is selected
    if (!selectedSquare) {
      // Select piece if it belongs to the local player
      if (piece && piece.player === localPlayer) {
        setSelectedSquare(position);
        const moves = getValidMoves(piece, gameState.board, gameState.phase);
        setValidMoves(moves);
      }
      return;
    }

    // If clicking the same square, deselect
    if (selectedSquare.row === position.row && selectedSquare.col === position.col) {
      setSelectedSquare(undefined);
      setValidMoves([]);
      return;
    }

    // Try to make a move
    const isValid = validMoves.some(m => m.row === position.row && m.col === position.col);
    if (isValid) {
      await makeMove(selectedSquare, position);
      setSelectedSquare(undefined);
      setValidMoves([]);
    } else {
      // Select new piece if it belongs to the local player
      if (piece && piece.player === localPlayer) {
        setSelectedSquare(position);
        const moves = getValidMoves(piece, gameState.board, gameState.phase);
        setValidMoves(moves);
      } else {
        setSelectedSquare(undefined);
        setValidMoves([]);
      }
    }
  };

  const handleLeave = () => {
    leaveGame();
    onLeave();
  };

  if (!session) {
    return (
      <view className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background via-background to-muted/40">
        <text className="text-sm text-muted-foreground">Loading game state…</text>
      </view>
    );
  }

  const opponentName =
    localPlayer === 'green'
      ? session.players.gold?.name || 'Opponent'
      : session.players.green?.name || 'Opponent';
  const bothPlayersReady = Boolean(session.players.green && session.players.gold);
  const waitingForOpponent = !bothPlayersReady;

  return (
    <view className="min-h-screen bg-gradient-to-b from-background via-background to-muted/50">
      <Column className="min-h-screen max-w-6xl mx-auto px-4 py-10 gap-6">
        <Row className="justify-between items-start">
          <Column className="gap-1">
            <text className="text-2xl font-semibold tracking-tight">Senterej Match</text>
            <text className="text-sm text-muted-foreground">
              Session <text className="font-mono text-xs text-foreground">{session.id}</text>
            </text>
          </Column>
          <Button onClick={handleLeave} variant="ghost">
            Leave Game
          </Button>
        </Row>

        {waitingForOpponent && (
          <Alert>
            <AlertTitle>Waiting for your opponent</AlertTitle>
            <AlertDescription>
              Share the session code and keep this screen open. The game will update automatically as soon as they join.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Move failed</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        <Row className="gap-6" wrap="wrap">
          <Card className="flex-1 min-w-[320px] shadow-lg border-border/60">
            <CardHeader>
              <CardTitle>Game Board</CardTitle>
              <CardDescription>
                {localPlayer
                  ? `You are playing as the ${localPlayer === 'green' ? 'Green (First)' : 'Gold (Second)'} player.`
                  : 'Spectating this match.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <Board
                gameState={session.state}
                selectedSquare={selectedSquare}
                validMoves={validMoves}
                onSquarePress={handleSquarePress}
                localPlayer={localPlayer ?? undefined}
              />
            </CardContent>
          </Card>

          <Column className="gap-4 w-full lg:w-80">
            <Card className="shadow-lg border-border/60">
              <CardHeader>
                <CardTitle>Match Summary</CardTitle>
                <CardDescription>
                  {opponentName} is your current opponent.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GameInfo
                  gameState={session.state}
                  localPlayer={localPlayer ?? undefined}
                  opponentName={opponentName}
                />
              </CardContent>
            </Card>

            <Card className="shadow-lg border-border/60">
              <CardHeader>
                <CardTitle>Move History</CardTitle>
                <CardDescription>
                  Track the evolving board state as each move is recorded.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MoveHistory
                  moves={session.state.moves}
                  localPlayer={localPlayer ?? undefined}
                />
              </CardContent>
            </Card>
          </Column>
        </Row>
      </Column>
    </view>
  );
}
