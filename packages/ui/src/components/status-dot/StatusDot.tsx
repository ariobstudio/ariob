import React from 'react';
import { Box } from '../primitives';

export interface StatusDotProps {
  status?: 'online' | 'offline' | 'busy' | 'away';
  size?: number;
  className?: string;
}

const colorMap = {
  online: 'bg-green-500',
  offline: 'bg-gray-400',
  busy: 'bg-red-500',
  away: 'bg-yellow-400',
};

export const StatusDot: React.FC<StatusDotProps> = ({ status = 'offline', size = 10, className = '' }) => {
  return (
    <Box className={`inline-block rounded-full ${colorMap[status]} ${className}`} style={{ width: size, height: size }} />
  );
};
