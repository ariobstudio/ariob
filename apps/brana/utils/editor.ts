/**
 * Shared editor utilities for TipTap
 * Used by both web and native editors
 */
import type { Editor } from '@tiptap/react';
import { TextSelection } from '@tiptap/pm/state';
import type { EditorState, EditorCommand } from '../types/editor';

/**
 * Extract the current editor state from a TipTap editor instance
 */
export function extractEditorState(editor: Editor): EditorState {
  const { state } = editor;
  const { selection } = state;
  const { $from, empty } = selection;

  // Get list information
  let listDepth = 0;
  let listItemIndex = 0;
  let listLength = 0;

  // Traverse up to find list context
  for (let depth = $from.depth; depth > 0; depth--) {
    const node = $from.node(depth);
    if (node.type.name === 'bulletList' || node.type.name === 'orderedList' || node.type.name === 'taskList') {
      listDepth++;
      if (listLength === 0) {
        listLength = node.childCount;
        // Find the index of the current list item
        const listItemPos = $from.before(depth + 1);
        let index = 0;
        node.forEach((child, offset) => {
          if ($from.pos >= listItemPos + offset && $from.pos <= listItemPos + offset + child.nodeSize) {
            listItemIndex = index;
          }
          index++;
        });
      }
    }
  }

  return {
    headingLevel: editor.isActive('heading', { level: 1 })
      ? 1
      : editor.isActive('heading', { level: 2 })
        ? 2
        : 0,
    isBulletList: editor.isActive('bulletList'),
    isOrderedList: editor.isActive('orderedList'),
    isBlockquote: editor.isActive('blockquote'),
    listDepth,
    listItemIndex,
    listLength,
    isEmpty: editor.isEmpty,
    hasSelection: !empty,
    isBold: editor.isActive('bold'),
    isItalic: editor.isActive('italic'),
    isStrike: editor.isActive('strike'),
    isLink: editor.isActive('link'),
    linkUrl: editor.getAttributes('link').href || null,
    isTaskList: editor.isActive('taskList'),
    canUndo: editor.can().undo(),
    canRedo: editor.can().redo(),
  };
}

/**
 * Execute an editor command on a TipTap editor instance
 */
export function executeCommand(editor: Editor, command: EditorCommand): void {
  switch (command.type) {
    case 'setHeading':
      editor.chain().focus().toggleHeading({ level: command.level }).run();
      break;
    case 'setParagraph':
      editor.chain().focus().setParagraph().run();
      break;
    case 'toggleBulletList':
      editor.chain().focus().toggleBulletList().run();
      break;
    case 'toggleOrderedList':
      editor.chain().focus().toggleOrderedList().run();
      break;
    case 'toggleBlockquote':
      editor.chain().focus().toggleBlockquote().run();
      break;
    case 'toggleTaskList':
      editor.chain().focus().toggleTaskList().run();
      break;
    case 'toggleBold':
      editor.chain().focus().toggleBold().run();
      break;
    case 'toggleItalic':
      editor.chain().focus().toggleItalic().run();
      break;
    case 'toggleStrike':
      editor.chain().focus().toggleStrike().run();
      break;
    case 'setLink':
      if (command.url) {
        editor.chain().focus().extendMarkRange('link').setLink({ href: command.url }).run();
      }
      break;
    case 'unsetLink':
      editor.chain().focus().unsetLink().run();
      break;
    case 'undo':
      editor.chain().focus().undo().run();
      break;
    case 'redo':
      editor.chain().focus().redo().run();
      break;
    case 'indent':
      if (editor.isActive('taskList')) {
        editor.chain().focus().sinkListItem('taskItem').run();
      } else {
        editor.chain().focus().sinkListItem('listItem').run();
      }
      break;
    case 'outdent':
      if (editor.isActive('taskList')) {
        editor.chain().focus().liftListItem('taskItem').run();
      } else {
        editor.chain().focus().liftListItem('listItem').run();
      }
      break;
    case 'moveUp':
      moveListItem(editor, 'up');
      break;
    case 'moveDown':
      moveListItem(editor, 'down');
      break;
  }
}

/**
 * Move a list item up or down within its parent list
 * Preserves cursor position relative to the list item content
 */
export function moveListItem(editor: Editor, direction: 'up' | 'down'): void {
  const { state, view } = editor;
  const { $from } = state.selection;

  // Find list item depth
  let listItemDepth = -1;
  for (let d = $from.depth; d > 0; d--) {
    const node = $from.node(d);
    if (node.type.name === 'listItem' || node.type.name === 'taskItem') {
      listItemDepth = d;
      break;
    }
  }

  if (listItemDepth === -1) return;

  const listItemPos = $from.before(listItemDepth);
  const listItem = $from.node(listItemDepth);
  const parent = $from.node(listItemDepth - 1);
  const indexInParent = $from.index(listItemDepth - 1);

  // Calculate cursor offset relative to list item start
  const cursorOffsetInItem = $from.pos - listItemPos;

  // Bounds checking
  if (direction === 'up' && indexInParent === 0) return;
  if (direction === 'down' && indexInParent >= parent.childCount - 1) return;

  const tr = state.tr;
  const listItemEnd = listItemPos + listItem.nodeSize;

  if (direction === 'up') {
    const prevSibling = parent.child(indexInParent - 1);
    const targetPos = listItemPos - prevSibling.nodeSize;

    // Use slice to preserve the node structure
    const slice = tr.doc.slice(listItemPos, listItemEnd);
    tr.delete(listItemPos, listItemEnd);
    tr.insert(targetPos, slice.content);

    // Restore cursor at same relative position within the moved item
    const newCursorPos = targetPos + cursorOffsetInItem;
    try {
      tr.setSelection(TextSelection.create(tr.doc, newCursorPos));
    } catch {
      // If exact position fails, try to get as close as possible
      try {
        tr.setSelection(TextSelection.near(tr.doc.resolve(newCursorPos)));
      } catch {
        tr.setSelection(TextSelection.near(tr.doc.resolve(targetPos + 1)));
      }
    }
  } else {
    const nextSibling = parent.child(indexInParent + 1);
    const insertPos = listItemPos + nextSibling.nodeSize;

    // Use slice to preserve the node structure
    const slice = tr.doc.slice(listItemPos, listItemEnd);
    tr.delete(listItemPos, listItemEnd);
    tr.insert(insertPos, slice.content);

    // Restore cursor at same relative position within the moved item
    const newCursorPos = insertPos + cursorOffsetInItem;
    try {
      tr.setSelection(TextSelection.create(tr.doc, newCursorPos));
    } catch {
      // If exact position fails, try to get as close as possible
      try {
        tr.setSelection(TextSelection.near(tr.doc.resolve(newCursorPos)));
      } catch {
        tr.setSelection(TextSelection.near(tr.doc.resolve(insertPos + 1)));
      }
    }
  }

  view.dispatch(tr);
}
