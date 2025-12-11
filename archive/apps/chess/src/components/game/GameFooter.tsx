/**
 * Game Footer Component
 *
 * Minimal action buttons for game controls
 */

import * as React from '@lynx-js/react';
import { Row, Button, Icon } from '@ariob/ui';

export interface GameFooterProps {
  onHistory?: () => void;
  onMenu?: () => void;
  onHelp?: () => void;
  hasMoves?: boolean;
}

export const GameFooter: React.FC<GameFooterProps> = ({
  onHistory,
  onMenu,
  onHelp,
  hasMoves = false,
}) => {
  return (
    <view className="border-t border-border/60 bg-background/95 px-5 pb-safe-bottom pt-3 backdrop-blur">
      <Row spacing="md" align="center" justify="center">
        {onHistory && (
          <Button
            variant="ghost"
            size="sm"
            onTap={onHistory}
            prefix={<Icon name="history" />}
            disabled={!hasMoves}
          >
            History
          </Button>
        )}

        {onMenu && (
          <Button
            variant="ghost"
            size="sm"
            onTap={onMenu}
            prefix={<Icon name="menu" />}
          >
            Menu
          </Button>
        )}

        {onHelp && (
          <Button
            variant="ghost"
            size="sm"
            onTap={onHelp}
            prefix={<Icon name="circle-question-mark" />}
          >
            Help
          </Button>
        )}
      </Row>
    </view>
  );
};
