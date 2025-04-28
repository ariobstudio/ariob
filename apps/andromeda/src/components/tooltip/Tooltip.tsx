import React, { useState } from 'react';
import { Box, Text } from '../primitives';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, className = '' }) => {
  const [visible, setVisible] = useState(false);
  return (
    <Box className="relative inline-block">
      <Box
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        className="inline-block"
      >
        {children}
      </Box>
      {visible && (
        <Box className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-md bg-black text-white text-xs shadow-lg z-10 ${className}`} style={{ whiteSpace: 'nowrap' }}>
          <Text>{content}</Text>
        </Box>
      )}
    </Box>
  );
};
