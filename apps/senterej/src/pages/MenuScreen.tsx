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
  CardFooter,
  Input,
} from '@ariob/ui';

interface MenuScreenProps {
  onCreateGame: () => void;
  onJoinGame: (sessionId: string) => void;
}

export function MenuScreen({ onCreateGame, onJoinGame }: MenuScreenProps) {
  const [sessionId, setSessionId] = React.useState('');

  const handleJoinGame = () => {
    const trimmed = sessionId.trim();
    if (trimmed) {
      onJoinGame(trimmed);
    }
  };

  return (
    <view className="min-h-screen bg-gradient-to-br from-background via-background to-muted/50">
      <Column className="min-h-screen max-w-3xl mx-auto px-4 py-12 gap-8">
        <Card className="shadow-lg border-border/70">
          <CardHeader>
            <CardTitle className="text-3xl font-semibold">Senterej</CardTitle>
            <CardDescription>
              Play the Ethiopian variant of chess with friends using peer-to-peer sessions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <text className="text-sm text-muted-foreground leading-relaxed">
              Create a new table to host a match or join an existing duel with a shared code.
              Senterej allows flexible openings, so discuss your initial setup with your opponent
              before the battle begins.
            </text>
          </CardContent>
        </Card>

        <Row className="w-full gap-4" wrap="wrap">
          <Card className="flex-1 min-w-[260px] shadow-md border-border/60">
            <CardHeader>
              <CardTitle>Host a New Match</CardTitle>
              <CardDescription>
                Generate a session code and share it with your challenger.
              </CardDescription>
            </CardHeader>
            <CardFooter className="px-6">
              <Button onClick={onCreateGame} className="w-full">
                Create Game
              </Button>
            </CardFooter>
          </Card>

          <Card className="flex-1 min-w-[260px] shadow-md border-border/60">
            <CardHeader>
              <CardTitle>Join with a Code</CardTitle>
              <CardDescription>
                Jump into an existing session that is waiting for an opponent.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Column className="gap-2">
                <text className="text-sm font-medium text-foreground">Session Code</text>
                <Input
                  value={sessionId}
                  onChange={setSessionId}
                  placeholder="e.g. session-1234"
                />
              </Column>
            </CardContent>
            <CardFooter className="px-6">
              <Button onClick={handleJoinGame} variant="secondary" className="w-full">
                Join Game
              </Button>
            </CardFooter>
          </Card>
        </Row>
      </Column>
    </view>
  );
}
