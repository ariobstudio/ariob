// Editor State - represents the current state of the editor
export interface EditorState {
  // Block formatting
  headingLevel: 0 | 1 | 2;
  isBlockquote: boolean;

  // List state
  isBulletList: boolean;
  isOrderedList: boolean;
  isTaskList: boolean;
  listDepth: number;
  listItemIndex: number;
  listLength: number;

  // Inline formatting
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  isStrike: boolean;
  isLink: boolean;
  linkUrl: string | null;

  // Selection state
  hasSelection: boolean;
  isEmpty: boolean;

  // History state
  canUndo: boolean;
  canRedo: boolean;
}

// Editor Commands - actions that can be performed on the editor
export type EditorCommand =
  // Block commands
  | { type: 'setHeading'; level: 1 | 2 }
  | { type: 'setParagraph' }
  | { type: 'toggleBlockquote' }
  // List commands
  | { type: 'toggleBulletList' }
  | { type: 'toggleOrderedList' }
  | { type: 'toggleTaskList' }
  | { type: 'indent' }
  | { type: 'outdent' }
  | { type: 'moveUp' }
  | { type: 'moveDown' }
  // Inline commands
  | { type: 'toggleBold' }
  | { type: 'toggleItalic' }
  | { type: 'toggleUnderline' }
  | { type: 'toggleStrike' }
  | { type: 'setLink'; url?: string }
  | { type: 'unsetLink' }
  // History commands
  | { type: 'undo' }
  | { type: 'redo' }
  // Paper management
  | { type: 'createNewPaper' };

// Pending Command - a command waiting to be executed
export interface PendingCommand {
  id: string;
  command: EditorCommand;
}

// Toolbar Context - determines which toolbar buttons to show
export type ToolbarContext = 'default' | 'list' | 'selection' | 'link-input';

export function getToolbarContext(
  state: EditorState,
  isLinkInputMode: boolean
): ToolbarContext {
  if (isLinkInputMode) return 'link-input';
  if (state.hasSelection) return 'selection';
  if (state.isBulletList || state.isOrderedList || state.isTaskList) return 'list';
  return 'default';
}

// Initial editor state
export const initialEditorState: EditorState = {
  headingLevel: 0,
  isBlockquote: false,
  isBulletList: false,
  isOrderedList: false,
  isTaskList: false,
  listDepth: 0,
  listItemIndex: 0,
  listLength: 0,
  isBold: false,
  isItalic: false,
  isUnderline: false,
  isStrike: false,
  isLink: false,
  linkUrl: null,
  hasSelection: false,
  isEmpty: true,
  canUndo: false,
  canRedo: false,
};
