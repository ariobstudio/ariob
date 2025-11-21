/**
 * Board Skeleton Loader
 *
 * Displays a placeholder chess board while loading game state
 */

import * as React from '@lynx-js/react';
import { cn } from '@ariob/ui';
import { useSettings, BOARD_THEMES } from '../store/settings';

export const BoardSkeleton: React.FC = () => {
  // Get current board theme from settings
  const boardTheme = useSettings((state) => state.boardTheme);
  const themeColors = BOARD_THEMES[boardTheme];
  const lightColor = themeColors.lightSquare;
  const darkColor = themeColors.darkSquare;

  return (
    <view className="w-full h-full flex flex-col bg-card">
      {/* Render 8 rows */}
      {Array.from({ length: 8 }).map((_, rowIndex) => (
        <view key={rowIndex} className="flex flex-row flex-1 w-full">
          {/* Render 8 columns */}
          {Array.from({ length: 8 }).map((_, colIndex) => {
            const isLight = (rowIndex + colIndex) % 2 === 0;
            return (
              <view
                key={`${rowIndex}-${colIndex}`}
                className="flex flex-1 items-center justify-center"
                style={{
                  flexBasis: '12.5%',
                  width: '12.5%',
                  aspectRatio: 1,
                  backgroundColor: isLight ? lightColor : darkColor,
                  opacity: 0.4,
                }}
              />
            );
          })}
        </view>
      ))}
    </view>
  );
};
