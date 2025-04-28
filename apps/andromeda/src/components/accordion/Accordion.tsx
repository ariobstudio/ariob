import React, { useState } from 'react';
import { Box, Text } from '../primitives';

export interface AccordionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  isOpen?: boolean;
  onToggle?: (open: boolean) => void;
}

export const Accordion: React.FC<AccordionProps> = ({ title, children, className = '', isOpen = false, onToggle }) => {
  const [open, setOpen] = useState(isOpen);
  return (
    <Box className={`border border-outline rounded-lg mb-2 ${className}`}>
      <Box className="cursor-pointer p-4 flex items-center justify-between" onClick={() => setOpen(!open)}>
        <Text className="font-semibold">{title}</Text>
        <Text>{open ? '-' : '+'}</Text>
      </Box>
      {open && <Box className="p-4 border-t border-outline">{children}</Box>}
    </Box>
  );
};
