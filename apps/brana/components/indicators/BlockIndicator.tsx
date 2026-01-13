/**
 * Block Indicator Component
 * Shows circular dots ABOVE each block element (on top, not to the left)
 * Displays for all block types: paragraphs, headings, lists, blockquotes, etc.
 */
import React from 'react';

export interface BlockIndicatorProps {
  /** Position of the indicator (above the block, relative to container) */
  position: { top: number; left: number };
  /** Whether the menu is currently active/shown */
  isActive: boolean;
}

export const BlockIndicator = ({ position, isActive }: BlockIndicatorProps) => {
  return (
    <div
      className="block-indicator"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
      aria-hidden="true"
    >
      <div className="block-dots" data-active={isActive}>
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  );
};
