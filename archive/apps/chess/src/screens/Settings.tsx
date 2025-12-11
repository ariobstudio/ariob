/**
 * Settings Screen
 *
 * Comprehensive settings for Senterej chess
 * - Player profile (name)
 * - Board appearance (theme)
 * - Gameplay preferences
 * - Advanced options
 */

import { useState, useEffect, useRef } from '@lynx-js/react';
import {
  Column,
  Row,
  Button,
  Icon,
  Input,
  Card,
  CardHeader,
  CardContent,
  Badge,
  useTheme,
  Theme,
  Scrollable,
  Stack,
  cn,
} from '@ariob/ui';
import { useUserProfile } from '@ariob/core';
import type { IGunChainReference } from '@ariob/core';
import type { NavigatorInstance } from '../components/Navigation';
import { useSettings, BOARD_THEMES, type GameSettings } from '../store/settings';

export interface SettingsScreenProps {
  data?: any;
  navigator?: NavigatorInstance;
  graph: IGunChainReference;
}

/**
 * Settings screen component
 */
export function SettingsScreen({ navigator, graph }: SettingsScreenProps) {
  const settings = useSettings();
  const { currentTheme, setTheme } = useTheme();
  const { profile, updateAlias, updateBoardTheme } = useUserProfile(graph);
  const lastProfileAlias = useRef<string | null>(null);
  const lastProfileTheme = useRef<string | null>(null);

  // Get current values for comparison
  const currentDisplayName = useSettings((state) => state.displayName);
  const currentBoardTheme = useSettings((state) => state.boardTheme);

  // Continuous sync: Always keep Zustand in sync with Gun profile
  // This ensures updates from other devices are reflected immediately
  useEffect(() => {
    'background only';

    if (!profile) return;

    const remoteAlias = profile.alias;
    if (
      remoteAlias &&
      remoteAlias !== lastProfileAlias.current
    ) {
      lastProfileAlias.current = remoteAlias;
      if (remoteAlias !== currentDisplayName) {
        console.log('[Settings] Syncing name from Gun:', remoteAlias);
        settings.updateDisplayName(remoteAlias);
      }
    }

    const remoteBoardTheme = profile.boardTheme;
    if (
      remoteBoardTheme &&
      remoteBoardTheme !== lastProfileTheme.current
    ) {
      lastProfileTheme.current = remoteBoardTheme;
      if (remoteBoardTheme !== currentBoardTheme) {
        console.log('[Settings] Syncing theme from Gun:', remoteBoardTheme);
        settings.updateBoardTheme(remoteBoardTheme);
      }
    }
  }, [profile?.alias, profile?.boardTheme, currentDisplayName, currentBoardTheme]);

  // Display Gun profile if available, otherwise show Zustand value
  const displayName = profile?.alias || settings.displayName;
  const [tempName, setTempName] = useState(displayName);

  const handleSaveName = () => {
    'background only';
    if (tempName.trim()) {
      // Save to both Zustand (immediate UI) and Gun (persistence)
      settings.updateDisplayName(tempName);
      updateAlias(tempName);
    }
  };

  const handleThemeChange = (themeId: GameSettings['boardTheme']) => {
    'background only';
    // Save to both Zustand (immediate UI) and Gun (persistence)
    settings.updateBoardTheme(themeId);
    updateBoardTheme(themeId);
  };

  const handleBack = () => {
    'background only';
    if (navigator) {
      navigator.goBack();
    }
  };

  return (
    <Column height="screen" spacing="none" className="bg-background text-foreground">
      <view className="border-b border-border/60 bg-background/95 px-5 pb-4 text-foreground backdrop-blur">
        <Row className="items-center justify-between">
          <Row className="items-center gap-3">
            <Button variant="ghost" size="icon" onTap={handleBack}>
              <Icon name="arrow-left" />
            </Button>
            <text className="text-xl font-semibold">
              Settings
            </text>
          </Row>
          <Button
            variant="ghost"
            size="sm"
            onTap={() => settings.resetSettings()}
          >
            <text className="text-sm text-muted-foreground">
              Reset All
            </text>
          </Button>
        </Row>
      </view>

      <Scrollable direction="vertical" className="flex-1 px-5 py-5 pb-safe-bottom">
        <Stack spacing="md">
          {/* Player Settings */}
          <Card>
            <CardHeader>
              <Row className="items-center gap-2">
                <Icon name="user" className="text-primary" />
                <text className="text-base font-semibold">Player Profile</text>
              </Row>
            </CardHeader>
            <CardContent>
              <Column className="gap-4">
                <view>
                  <text className="text-sm text-muted-foreground mb-2">
                    Display Name
                  </text>
                  <Row className="gap-2">
                    <Input
                      value={tempName}
                      onChange={setTempName}
                      placeholder="Enter name"
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      onTap={handleSaveName}
                      disabled={
                        tempName === displayName || !tempName.trim()
                      }
                    >
                      <text className="text-sm">Save</text>
                    </Button>
                  </Row>
                  <text className="text-xs text-muted-foreground mt-1">
                    This name will appear in game lobbies
                  </text>
                </view>
              </Column>
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <Card>
            <CardHeader>
              <Row className="items-center gap-2">
                <Icon name="palette" className="text-primary" />
                <text className="text-base font-semibold">Appearance</text>
              </Row>
            </CardHeader>
            <CardContent>
              <Column className="gap-4">
                {/* App Theme (Light/Dark) */}
                <view>
                  <text className="text-sm font-medium mb-2">App Theme</text>
                  <Row className="gap-2">
                    {([Theme.Light, Theme.Dark, Theme.Auto] as const).map((theme) => (
                      <Button
                        key={theme}
                        size="sm"
                        variant={currentTheme === theme ? 'default' : 'outline'}
                        onTap={() => setTheme(theme)}
                        className="flex-1"
                      >
                        <Row className="items-center gap-1.5">
                          <Icon
                            name={
                              theme === Theme.Light
                                ? 'sun'
                                : theme === Theme.Dark
                                ? 'moon'
                                : 'monitor'
                            }
                            size="sm"
                          />
                          <text className="text-sm">
                            {theme === Theme.Light ? 'Light' : theme === Theme.Dark ? 'Dark' : 'Auto'}
                          </text>
                        </Row>
                      </Button>
                    ))}
                  </Row>
                  <text className="text-xs text-muted-foreground mt-1">
                    Choose between light and dark mode, or match your system
                  </text>
                </view>

                {/* Board Theme */}
                <view>
                  <text className="text-sm font-medium mb-3">Board Theme</text>
                  <scroll-view className="max-h-96">
                    <Column className="gap-2">
                      {Object.values(BOARD_THEMES).map((theme) => (
                        <ThemeCard
                          key={theme.id}
                          theme={theme}
                          isSelected={settings.boardTheme === theme.id}
                          onSelect={() => handleThemeChange(theme.id)}
                        />
                      ))}
                    </Column>
                  </scroll-view>
                </view>
              </Column>
            </CardContent>
          </Card>

          {/* Gameplay Settings */}
          <Card>
            <CardHeader>
              <Row className="items-center gap-2">
                <Icon name="gamepad-2" className="text-primary" />
                <text className="text-base font-semibold">Gameplay</text>
              </Row>
            </CardHeader>
            <CardContent>
              <Column className="gap-3">
                <SettingToggle
                  label="Show Move Hints"
                  description="Highlight valid moves when selecting pieces"
                  checked={settings.showMoveHints}
                  onChange={(checked) =>
                    settings.updateSettings({ showMoveHints: checked })
                  }
                />

                <SettingToggle
                  label="Show Captured Pieces"
                  description="Display captured pieces below player names"
                  checked={settings.showCapturedPieces}
                  onChange={(checked) =>
                    settings.updateSettings({ showCapturedPieces: checked })
                  }
                />

                <SettingToggle
                  label="Enable Haptics"
                  description="Vibration feedback on moves (iOS only)"
                  checked={settings.enableHaptics}
                  onChange={(checked) =>
                    settings.updateSettings({ enableHaptics: checked })
                  }
                />

                <SettingToggle
                  label="Sound Effects"
                  description="Play sounds for moves and captures"
                  checked={settings.enableSoundEffects}
                  onChange={(checked) =>
                    settings.updateSettings({ enableSoundEffects: checked })
                  }
                />
              </Column>
            </CardContent>
          </Card>

          {/* Advanced Settings */}
          <Card>
            <CardHeader>
              <Row className="items-center gap-2">
                <Icon name="settings" className="text-primary" />
                <text className="text-base font-semibold">Advanced</text>
              </Row>
            </CardHeader>
            <CardContent>
              <Column className="gap-4">
                <SettingToggle
                  label="Show Board Coordinates"
                  description="Display A–H / 1–8 guides (customize in config/board.json)"
                  checked={settings.showCoordinates}
                  onChange={(checked) =>
                    settings.updateSettings({ showCoordinates: checked })
                  }
                />

                <view>
                  <text className="text-sm font-medium mb-2">
                    Animation Speed
                  </text>
                  <Row className="gap-2">
                    {(['slow', 'normal', 'fast'] as const).map((speed) => (
                      <Button
                        key={speed}
                        size="sm"
                        variant={
                          settings.animationSpeed === speed ? 'default' : 'outline'
                        }
                        onTap={() =>
                          settings.updateSettings({ animationSpeed: speed })
                        }
                        className="flex-1"
                      >
                        <text className="text-sm capitalize">{speed}</text>
                      </Button>
                    ))}
                  </Row>
                  <text className="text-xs text-muted-foreground mt-1">
                    Control the speed of piece animations
                  </text>
                </view>
              </Column>
            </CardContent>
          </Card>

          {/* About */}
          <Card>
            <CardHeader>
              <Row className="items-center gap-2">
                <Icon name="info" className="text-primary" />
                <text className="text-base font-semibold">About</text>
              </Row>
            </CardHeader>
            <CardContent>
              <Column className="gap-2">
                <Row className="justify-between">
                  <text className="text-sm text-muted-foreground">Version</text>
                  <text className="text-sm font-medium">1.0.0</text>
                </Row>
                <Row className="justify-between">
                  <text className="text-sm text-muted-foreground">
                    Game Variant
                  </text>
                  <Badge>Senterej</Badge>
                </Row>
                <Row className="justify-between">
                  <text className="text-sm text-muted-foreground">
                    Piece Set
                  </text>
                  <text className="text-sm font-medium capitalize">
                    {settings.pieceSet}
                  </text>
                </Row>
              </Column>
            </CardContent>
          </Card>
        </Stack>
      </Scrollable>
    </Column>
  );
}

/**
 * Theme card component
 */
interface ThemeCardProps {
  theme: typeof BOARD_THEMES[keyof typeof BOARD_THEMES];
  isSelected: boolean;
  onSelect: () => void;
}

function ThemeCard({ theme, isSelected, onSelect }: ThemeCardProps) {
  return (
    <view
      className={cn(
        'p-3 rounded-lg border-2 transition-colors',
        isSelected ? 'border-primary bg-primary/10 shadow-sm' : 'border-border bg-card'
      )}
      bindtap={onSelect}
    >
      <Row className="items-center justify-between">
        <Row className="items-center gap-3">
          {/* Theme preview squares */}
          <Row className="gap-0">
            <view
              style={{
                width: '28px',
                height: '28px',
                backgroundColor: theme.lightSquare,
                borderRadius: '4px 0 0 4px',
                border: '1px solid rgba(0,0,0,0.1)',
              }}
            />
            <view
              style={{
                width: '28px',
                height: '28px',
                backgroundColor: theme.darkSquare,
                borderRadius: '0 4px 4px 0',
                border: '1px solid rgba(0,0,0,0.1)',
              }}
            />
          </Row>

          <Column>
            <text className="font-medium text-sm">{theme.name}</text>
            <text className="text-xs text-muted-foreground">
              {theme.description}
            </text>
          </Column>
        </Row>

        {isSelected && <Icon name="check" size="sm" className="text-primary" />}
      </Row>
    </view>
  );
}

/**
 * Toggle switch component
 */
interface SettingToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function SettingToggle({
  label,
  description,
  checked,
  onChange,
}: SettingToggleProps) {
  return (
    <Row className="justify-between items-center py-2">
      <Column className="flex-1 pr-4">
        <text className="text-sm font-medium">{label}</text>
        <text className="text-xs text-muted-foreground">{description}</text>
      </Column>

      <view
        className={cn(
          'rounded-full transition-colors flex items-center',
          checked ? 'bg-primary' : 'bg-muted'
        )}
        style={{
          width: '48px',
          height: '28px',
          padding: '2px',
          cursor: 'pointer',
        }}
        bindtap={() => onChange(!checked)}
      >
        <view
          className="rounded-full bg-background transition-transform shadow-sm"
          style={{
            width: '24px',
            height: '24px',
            transform: checked ? 'translateX(20px)' : 'translateX(0)',
            transitionDuration: '200ms',
          }}
        />
      </view>
    </Row>
  );
}
