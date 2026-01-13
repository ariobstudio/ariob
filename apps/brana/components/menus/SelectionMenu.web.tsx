/**
 * Selection Menu Component (Web)
 * Floating menu for inline formatting (bold, italic, link)
 */
import React from 'react';
import { Icon } from '../icons';
import type { SelectionMenuProps } from './types';

export function SelectionMenu({
  isVisible,
  position,
  commands,
  selectedIndex,
  onCommandClick,
  isCommandActive,
  menuRef,
}: SelectionMenuProps) {
  return (
    <div
      ref={menuRef}
      className="selection-menu"
      data-visible={isVisible}
      style={{
        top: position.top,
        left: position.left,
      }}
      role="toolbar"
      aria-label="Text formatting options"
      aria-orientation="horizontal"
      aria-hidden={!isVisible}
      onMouseDown={(e) => e.preventDefault()}
    >
      <div className="block-menu__icons" role="group">
        {commands.map((cmd, index) => {
          const isActive = isCommandActive(cmd.id);
          return (
            <button
              key={cmd.id}
              className="block-menu-icon"
              data-selected={index === selectedIndex}
              data-active={isActive}
              onMouseDown={(e) => {
                e.preventDefault();
                onCommandClick(cmd);
              }}
              title={cmd.title}
              aria-label={cmd.title}
              aria-pressed={isActive}
              tabIndex={index === selectedIndex ? 0 : -1}
            >
              <Icon name={cmd.iconName} variant={cmd.iconVariant} size="md" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
