import * as React from '@lynx-js/react';
import { MenuScreen } from './pages/MenuScreen';
import { LobbyScreen } from './pages/LobbyScreen';
import { GameScreen } from './pages/GameScreen';

type Screen = 'menu' | 'lobby' | 'game';

export function App() {
  const [currentScreen, setCurrentScreen] = React.useState<Screen>('menu');
  const [sessionId, setSessionId] = React.useState<string | undefined>();

  return (
    <page className="min-h-screen bg-background">
      {currentScreen === 'menu' && (
        <MenuScreen
          onCreateGame={() => setCurrentScreen('lobby')}
          onJoinGame={(id) => {
            setSessionId(id);
            setCurrentScreen('game');
          }}
        />
      )}
      
      {currentScreen === 'lobby' && (
        <LobbyScreen
          onGameStart={(id) => {
            setSessionId(id);
            setCurrentScreen('game');
          }}
          onBack={() => setCurrentScreen('menu')}
        />
      )}
      
      {currentScreen === 'game' && sessionId && (
        <GameScreen
          sessionId={sessionId}
          onLeave={() => {
            setSessionId(undefined);
            setCurrentScreen('menu');
          }}
        />
      )}
    </page>
  );
}
