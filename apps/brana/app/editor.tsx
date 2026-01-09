"use dom";
import '../global.web.css';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useRef, useMemo } from 'react';
import type { Editor } from '@tiptap/react';
import { TextSelection } from '@tiptap/pm/state';

const placeholders = [
  "What's on your mind?",
  "Start writing...",
  "Capture your thoughts...",
  "Write something amazing...",
  "Let your ideas flow...",
  "Begin your story...",
  "What are you thinking about?",
  "Jot down your ideas...",
  "Express yourself...",
  "Start creating...",
];

interface EditorState {
  headingLevel: 0 | 1 | 2;
  isBulletList: boolean;
  isOrderedList: boolean;
  isBlockquote: boolean;
  listDepth: number;
  listItemIndex: number;
  listLength: number;
  isEmpty: boolean;
  hasSelection: boolean;
  isBold: boolean;
  isStrike: boolean;
  isLink: boolean;
  linkUrl: string | null;
  isTaskList: boolean;
  canUndo: boolean;
  canRedo: boolean;
}

interface EditorCommand {
  type: string;
  level?: number;
  url?: string;
}

interface PendingCommand {
  id: string;
  command: EditorCommand;
}

interface EditorProps {
  onStateChange: (state: EditorState) => Promise<void>;
  onCommandExecuted: () => Promise<void>;
  pendingCommand: PendingCommand | null;
  initialContent?: string;
  onContentChange?: (content: string) => void;
  dom?: import('expo/dom').DOMProps;
}

function extractEditorState(editor: Editor): EditorState {
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
    isStrike: editor.isActive('strike'),
    isLink: editor.isActive('link'),
    linkUrl: editor.getAttributes('link').href || null,
    isTaskList: editor.isActive('taskList'),
    canUndo: editor.can().undo(),
    canRedo: editor.can().redo(),
  };
}

function executeCommand(editor: Editor, command: EditorCommand): void {
  switch (command.type) {
    case 'setHeading':
      if (command.level) {
        editor.chain().focus().toggleHeading({ level: command.level as 1 | 2 }).run();
      }
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

function moveListItem(editor: Editor, direction: 'up' | 'down'): void {
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

    // Set cursor inside the moved item
    try {
      tr.setSelection(TextSelection.create(tr.doc, targetPos + 1));
    } catch {
      tr.setSelection(TextSelection.near(tr.doc.resolve(targetPos + 1)));
    }
  } else {
    const nextSibling = parent.child(indexInParent + 1);
    const insertPos = listItemPos + nextSibling.nodeSize;

    // Use slice to preserve the node structure
    const slice = tr.doc.slice(listItemPos, listItemEnd);
    tr.delete(listItemPos, listItemEnd);
    tr.insert(insertPos, slice.content);

    // Set cursor inside the moved item
    try {
      tr.setSelection(TextSelection.create(tr.doc, insertPos + 1));
    } catch {
      tr.setSelection(TextSelection.near(tr.doc.resolve(insertPos + 1)));
    }
  }

  view.dispatch(tr);
}

export default function TipTapEditor({
  onStateChange,
  onCommandExecuted,
  pendingCommand,
  initialContent = '',
  onContentChange,
}: EditorProps) {
  const lastCommandId = useRef<string | null>(null);
  const initialContentRef = useRef(initialContent);

  // Pick a random placeholder on mount
  const placeholder = useMemo(() => {
    return placeholders[Math.floor(Math.random() * placeholders.length)];
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'editor-link',
        },
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
        emptyNodeClass: 'is-empty',
      }),
    ],
    content: initialContentRef.current,
    onUpdate: ({ editor }) => {
      onStateChange(extractEditorState(editor));
      if (onContentChange) {
        onContentChange(editor.getHTML());
      }
    },
    onSelectionUpdate: ({ editor }) => {
      onStateChange(extractEditorState(editor));
    },
  });

  // Execute pending commands
  useEffect(() => {
    if (!editor || !pendingCommand) return;
    if (pendingCommand.id === lastCommandId.current) return;

    executeCommand(editor, pendingCommand.command);
    lastCommandId.current = pendingCommand.id;
    onCommandExecuted();
  }, [editor, pendingCommand, onCommandExecuted]);

  // Report initial state
  useEffect(() => {
    if (editor) {
      onStateChange(extractEditorState(editor));
    }
  }, [editor, onStateChange]);

  return (
    <div className="editor-container">
      <EditorContent editor={editor} className="editor-content" />
    </div>
  );
}
