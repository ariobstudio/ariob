/**
 * Block Menu Component (Web)
 * Floating menu for block-level formatting (headings, lists, quotes)
 */
import React from 'react';
import { MenuButton } from './MenuButton';
import type { BlockMenuProps } from './types';

export function BlockMenu({
  isVisible,
  position,
  commands,
  selectedIndex,
  activeIndex,
  onCommandClick,
  menuRef,
  ariaLabel = 'Block formatting options',
}: BlockMenuProps) {
  return (
    <div
      ref={menuRef}
      className="block-menu"
      data-visible={isVisible}
      style={{
        top: position.top,
        left: position.left,
      }}
      role="toolbar"
      aria-label={ariaLabel}
      aria-orientation="horizontal"
      aria-hidden={!isVisible}
    >
      <div className="block-menu__icons" role="group">
        {commands.map((cmd, index) => {
          const isActive = index === activeIndex;
          return (
            <MenuButton
              key={cmd.id}
              cmd={cmd}
              selected={index === selectedIndex}
              active={isActive}
              onClick={() => onCommandClick(cmd)}
              index={index}
              selectedIndex={selectedIndex}
            />
          );
        })}
      </div>
    </div>
  );
}
