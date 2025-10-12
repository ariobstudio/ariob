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
  List,
  ListItem,
  Alert,
  AlertTitle,
  AlertDescription,
} from '@ariob/ui';
import { useGameSession } from '@ariob/senterej/p2p';

interface LobbyScreenProps {
  onGameStart: (sessionId: string) => void;
  onBack: () => void;
}

export function LobbyScreen({ onGameStart, onBack }: LobbyScreenProps) {
  const [playerName, setPlayerName] = React.useState('Player');

  const { createGame, session, loading, error } = useGameSession({
    playerName,
  });

  const hostPlayer = session?.players.green;
  const guestPlayer = session?.players.gold;
  const [hasNavigated, setHasNavigated] = React.useState(false);

  const handleCreateGame = async () => {
    if (!createGame || loading) return;
    const id = await createGame();
    if (!id) return;
  };

  React.useEffect(() => {
    if (session && !hasNavigated) {
      setHasNavigated(true);
      onGameStart(session.id);
    }
  }, [session, onGameStart, hasNavigated]);

  return (
    <view className="min-h-screen bg-gradient-to-br from-background via-background to-muted/40">
      <Column className="min-h-screen max-w-4xl mx-auto px-4 py-12 gap-6">
        <Row className="justify-between items-center">
          <Column className="gap-1">
            <text className="text-2xl font-semibold tracking-tight">Host a Senterej Table</text>
            <text className="text-sm text-muted-foreground">
              Share the session code with your opponent to begin the opening ceremony.
            </text>
          </Column>
          <Button onClick={onBack} variant="ghost">
            ← Back
          </Button>
        </Row>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Unable to create session</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        {!session && (
          <Card className="shadow-md border-border/60">
            <CardHeader>
              <CardTitle>Host Details</CardTitle>
              <CardDescription>
                Choose the name other players will see and create the peer-to-peer session.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Column className="gap-2">
                <text className="text-sm font-medium text-foreground">Display Name</text>
                <Input
                  value={playerName}
                  onChange={setPlayerName}
                  placeholder="Your name"
                />
              </Column>
            </CardContent>
            <CardFooter className="px-6">
              <Button onClick={handleCreateGame} disabled={loading} className="w-full">
                {loading ? 'Creating session…' : 'Create Game'}
              </Button>
            </CardFooter>
          </Card>
        )}

        {session && (
          <Row className="w-full gap-4" wrap="wrap">
            <Card className="flex-1 min-w-[260px] shadow-md border-border/60">
              <CardHeader>
                <CardTitle>Waiting for Opponent</CardTitle>
                <CardDescription>
                  Share this session code and stay on this screen while your opponent joins.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <view className="flex items-center justify-between rounded-lg border border-dashed border-border bg-muted/40 px-4 py-3">
                  <text className="text-sm font-medium text-muted-foreground">Session Code</text>
                  <text className="font-mono text-base">{session.id}</text>
                </view>

                <Column className="gap-2">
                  <text className="text-xs uppercase font-medium tracking-wider text-muted-foreground">
                    Players
                  </text>
                  <List variant="inset" padding="sm" gap="sm">
                    <ListItem
                      key="host"
                      variant="card"
                      title={hostPlayer?.name ?? playerName}
                      subtitle="Host"
                      rightElement={<text className="text-xs text-primary">Ready</text>}
                    />
                    <ListItem
                      key="guest"
                      variant="card"
                      title={guestPlayer?.name ?? 'Waiting for guest'}
                      subtitle="Opponent"
                      rightElement={
                        <text className="text-xs text-muted-foreground">
                          {guestPlayer ? 'Connected' : 'Pending'}
                        </text>
                      }
                    />
                  </List>
                </Column>
              </CardContent>
            </Card>

            <Card className="flex-1 min-w-[260px] shadow-md border-border/60">
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
                <CardDescription>
                  Once both players are present you will automatically enter the game board.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <Column className="gap-2">
                  <text>1. Share the session code above with your opponent.</text>
                  <text>2. Keep this tab open so the connection remains active.</text>
                  <text>3. Decide on your opening arrangement while you wait.</text>
                </Column>
              </CardContent>
            </Card>
          </Row>
        )}
      </Column>
    </view>
  );
}
