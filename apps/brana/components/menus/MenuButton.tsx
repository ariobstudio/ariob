/**
 * Menu Button Component with accessibility support
 */
import React, { useRef, useEffect } from 'react';
import { Icon } from '../icons';
import type { MenuButtonProps } from './types';

export function MenuButton({ cmd, selected, active, onClick, index, selectedIndex }: MenuButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Focus button when it becomes selected
  useEffect(() => {
    if (selected && buttonRef.current) {
      buttonRef.current.focus();
    }
  }, [selected]);

  return (
    <button
      ref={buttonRef}
      className="block-menu-icon"
      data-selected={selected}
      data-active={active}
      onClick={onClick}
      title={cmd.title}
      aria-label={cmd.title}
      aria-pressed={active}
      // Roving tabindex: only selected button is in tab order
      tabIndex={index === selectedIndex ? 0 : -1}
    >
      <Icon name={cmd.iconName} variant={cmd.iconVariant} size="md" />
    </button>
  );
}
