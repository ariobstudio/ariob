/**
 * Menu component type definitions
 */
import type { MenuCommand } from '../../constants/menuCommands';

export interface MenuButtonProps {
  cmd: MenuCommand;
  selected: boolean;
  active: boolean;
  onClick: () => void;
  index: number;
  selectedIndex: number;
}

export interface BlockMenuProps {
  isVisible: boolean;
  position: { top: number; left: number };
  commands: MenuCommand[];
  selectedIndex: number;
  activeIndex: number;
  onCommandClick: (cmd: MenuCommand) => void;
  menuRef?: React.RefObject<HTMLDivElement | null>;
  ariaLabel?: string;
}

export interface SelectionMenuProps {
  isVisible: boolean;
  position: { top: number; left: number };
  commands: MenuCommand[];
  selectedIndex: number;
  onCommandClick: (cmd: MenuCommand) => void;
  isCommandActive: (cmdId: string) => boolean;
  menuRef?: React.RefObject<HTMLDivElement | null>;
}
