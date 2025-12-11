/**
 * Status Badge Component
 *
 * Displays current game status with icon
 */

import * as React from '@lynx-js/react';
import { Row, Badge, Icon } from '@ariob/ui';
import type { BadgeProps, IconProps } from '@ariob/ui';

export interface StatusBadgeProps {
  message: string;
  icon?: IconProps['name'];
  variant?: BadgeProps['variant'];
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  message,
  icon = 'info',
  variant = 'outline',
}) => {
  return (
    <Badge variant={variant}>
      <Row spacing="xs" align="center">
        {icon && <Icon name={icon} size="sm" />}
        <text className="text-xs font-medium">{message}</text>
      </Row>
    </Badge>
  );
};
