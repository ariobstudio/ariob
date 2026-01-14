/**
 * Shared menu command definitions
 * Used by both web and native editors
 */
import type { EditorCommand } from '../types/editor';
import type { IconVariant } from '../components/icons';

/**
 * Menu command definition with unified icon system
 */
export interface MenuCommand {
  /** Unique command identifier */
  id: string;
  /** Display title */
  title: string;
  /** Optional description for tooltips/hints */
  description?: string;
  /** FontAwesome 6 icon name (unified for web + native) */
  iconName: string;
  /** Icon variant: 'solid' (default) or 'regular' */
  iconVariant?: IconVariant;
  /** Optional label to show alongside icon (e.g., "1" for H1) */
  label?: string;
  /** Editor command to execute */
  command: EditorCommand;
}

/**
 * Block-level commands (headings, lists, quotes)
 * Used in block menu and default toolbar context
 */
export const blockCommands: MenuCommand[] = [
  {
    id: 'h1',
    title: 'Heading 1',
    description: 'Large section heading',
    iconName: 'heading',
    command: { type: 'setHeading', level: 1 },
  },
  {
    id: 'h2',
    title: 'Heading 2',
    description: 'Medium section heading',
    iconName: 'heading',
    command: { type: 'setHeading', level: 2 },
  },
  {
    id: 'quote',
    title: 'Quote',
    description: 'Capture a quote',
    iconName: 'quote-left',
    command: { type: 'toggleBlockquote' },
  },
  {
    id: 'bullet',
    title: 'Bullet List',
    description: 'Create a simple list',
    iconName: 'list-ul',
    command: { type: 'toggleBulletList' },
  },
  {
    id: 'task',
    title: 'Task List',
    description: 'Track tasks with checkboxes',
    iconName: 'square-check',
    iconVariant: 'regular',
    command: { type: 'toggleTaskList' },
  },
];

/**
 * Inline formatting commands (bold, italic, strike, link)
 * Used in selection toolbar context
 */
export const inlineCommands: MenuCommand[] = [
  {
    id: 'bold',
    title: 'Bold',
    description: 'Make text bold',
    iconName: 'bold',
    command: { type: 'toggleBold' },
  },
  {
    id: 'italic',
    title: 'Italic',
    description: 'Make text italic',
    iconName: 'italic',
    command: { type: 'toggleItalic' },
  },
  {
    id: 'underline',
    title: 'Underline',
    description: 'Underline text',
    iconName: 'underline',
    command: { type: 'toggleUnderline' },
  },
  {
    id: 'strike',
    title: 'Strikethrough',
    description: 'Cross out text',
    iconName: 'strikethrough',
    command: { type: 'toggleStrike' },
  },
  {
    id: 'link',
    title: 'Link',
    description: 'Add a link',
    iconName: 'link',
    command: { type: 'setLink' },
  },
];

/**
 * List type switching commands
 * Used in list toolbar context - allows switching between list types
 */
export const listCommands: MenuCommand[] = [
  {
    id: 'bullet',
    title: 'Bullet',
    description: 'Convert to bullet list',
    iconName: 'list-ul',
    command: { type: 'toggleBulletList' },
  },
  {
    id: 'ordered',
    title: 'Ordered',
    description: 'Convert to numbered list',
    iconName: 'list-ol',
    command: { type: 'toggleOrderedList' },
  },
  {
    id: 'task',
    title: 'Task',
    description: 'Convert to task list',
    iconName: 'square-check',
    iconVariant: 'regular',
    command: { type: 'toggleTaskList' },
  },
  {
    id: 'backToBlock',
    title: 'More',
    description: 'Show all block options',
    iconName: 'ellipsis',
    iconVariant: 'solid',
    command: { type: 'setParagraph' }, // Special handling - shows all block options
  },
];

/**
 * All commands that can be triggered via slash menu
 */
export const slashMenuCommands = blockCommands;

/**
 * Get command by ID
 */
export function getCommandById(id: string): MenuCommand | undefined {
  return [...blockCommands, ...inlineCommands, ...listCommands].find(cmd => cmd.id === id);
}
