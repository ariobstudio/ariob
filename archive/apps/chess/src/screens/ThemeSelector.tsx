/**
 * Theme Selector Component
 *
 * Visual board theme selector with 2x2 previews of each theme
 */

import * as React from '@lynx-js/react';
import { Row, Column, cn } from '@ariob/ui';
import { BOARD_THEMES, useSettings, type GameSettings } from '../store/settings';

export const ThemeSelector: React.FC = () => {
  const boardTheme = useSettings((state) => state.boardTheme);
  const updateBoardTheme = useSettings((state) => state.updateBoardTheme);

  const handleThemeSelect = (themeId: GameSettings['boardTheme']) => {
    'background only';
    updateBoardTheme(themeId);
  };

  return (
    <view className="w-full">
      <text className="text-sm font-medium mb-3 text-foreground">Board Theme</text>

      <view className="grid grid-cols-2 gap-3">
        {Object.values(BOARD_THEMES).map((theme) => {
          const isSelected = boardTheme === theme.id;

          return (
            <view
              key={theme.id}
              bindtap={() => handleThemeSelect(theme.id)}
              className={cn(
                'relative rounded-xl border-2 p-3 transition-all',
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card'
              )}
            >
              {/* Theme preview - 2x2 mini board */}
              <view className="mb-2 rounded-lg overflow-hidden border border-border/50">
                <Row spacing="none">
                  <view
                    style={{
                      width: '50%',
                      aspectRatio: 1,
                      backgroundColor: theme.lightSquare,
                    }}
                  />
                  <view
                    style={{
                      width: '50%',
                      aspectRatio: 1,
                      backgroundColor: theme.darkSquare,
                    }}
                  />
                </Row>
                <Row spacing="none">
                  <view
                    style={{
                      width: '50%',
                      aspectRatio: 1,
                      backgroundColor: theme.darkSquare,
                    }}
                  />
                  <view
                    style={{
                      width: '50%',
                      aspectRatio: 1,
                      backgroundColor: theme.lightSquare,
                    }}
                  />
                </Row>
              </view>

              {/* Theme info */}
              <Column spacing="xs">
                <text
                  className={cn(
                    'text-sm font-semibold',
                    isSelected ? 'text-primary' : 'text-foreground'
                  )}
                >
                  {theme.name}
                </text>
                <text className="text-xs text-muted-foreground">
                  {theme.description}
                </text>
              </Column>

              {/* Selected indicator */}
              {isSelected && (
                <view
                  className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                >
                  <text className="text-xs text-primary-foreground">✓</text>
                </view>
              )}
            </view>
          );
        })}
      </view>
    </view>
  );
};
