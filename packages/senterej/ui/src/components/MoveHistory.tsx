import * as React from '@lynx-js/react';
import { Scrollable, List, ListItem, Card, CardHeader, CardTitle, CardContent } from '@ariob/ui';
import type { Move, Position } from '@ariob/senterej/engine';

const PIECE_SYMBOLS = {
  negus: { green: '♔', gold: '♚' },
  fers: { green: '♕', gold: '♛' },
  saba: { green: '♗', gold: '♝' },
  ferese: { green: '♘', gold: '♞' },
  der: { green: '♖', gold: '♜' },
  medeq: { green: '♙', gold: '♟' }
} as const;

interface MoveHistoryProps {
  moves: Move[];
  localPlayer?: 'green' | 'gold';
}

export const MoveHistory: React.FC<MoveHistoryProps> = ({ moves, localPlayer }) => {
  const formatPosition = (pos: Position) => {
    const file = String.fromCharCode(97 + pos.col);
    const rank = pos.row + 1;
    return `${file}${rank}`;
  };

  const formatMove = (move: Move, index: number) => {
    const piece = PIECE_SYMBOLS[move.piece.type][move.piece.player];
    const from = formatPosition(move.from);
    const to = formatPosition(move.to);
    const capture = move.captured ? 'x' : '-';
    const player = move.player === localPlayer ? 'You' : 'Opponent';

    return {
      title: `${index + 1}. ${piece} ${from}${capture}${to}`,
      subtitle: player,
      time: new Date(move.timestamp).toLocaleTimeString()
    };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Move History</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Scrollable className="max-h-64">
          <List>
            {moves.length === 0 ? (
              <ListItem title="No moves yet" subtitle="Game hasn't started" />
            ) : (
              moves.map((move, i) => {
                const formatted = formatMove(move, i);
                return (
                  <ListItem
                    key={i}
                    title={formatted.title}
                    subtitle={`${formatted.subtitle} • ${formatted.time}`}
                  />
                );
              })
            )}
          </List>
        </Scrollable>
      </CardContent>
    </Card>
  );
};
