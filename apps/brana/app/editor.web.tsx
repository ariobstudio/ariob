"use dom";
import '../global.web.css';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Placeholder from '@tiptap/extension-placeholder';
import { Extension } from '@tiptap/core';
import { useEffect, useRef, useMemo, useState, useCallback } from 'react';
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

interface SpaceMenuCommand {
  title: string;
  icon: string;
  command: (editor: Editor) => void;
}

const spaceMenuCommands: SpaceMenuCommand[] = [
  {
    title: 'Heading 1',
    icon: 'H1',
    command: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    title: 'Heading 2',
    icon: 'H2',
    command: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    title: 'Quote',
    icon: '❝',
    command: (editor) => editor.chain().focus().toggleBlockquote().run(),
  },
  {
    title: 'Bullet List',
    icon: '•',
    command: (editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    title: 'Numbered List',
    icon: '1.',
    command: (editor) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    title: 'Task List',
    icon: '☐',
    command: (editor) => editor.chain().focus().toggleTaskList().run(),
  },
];

function extractEditorState(editor: Editor): EditorState {
  const { state } = editor;
  const { selection } = state;
  const { $from, empty } = selection;

  let listDepth = 0;
  let listItemIndex = 0;
  let listLength = 0;

  for (let depth = $from.depth; depth > 0; depth--) {
    const node = $from.node(depth);
    if (node.type.name === 'bulletList' || node.type.name === 'orderedList' || node.type.name === 'taskList') {
      listDepth++;
      if (listLength === 0) {
        listLength = node.childCount;
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

  if (direction === 'up' && indexInParent === 0) return;
  if (direction === 'down' && indexInParent >= parent.childCount - 1) return;

  const tr = state.tr;
  const listItemEnd = listItemPos + listItem.nodeSize;

  if (direction === 'up') {
    const prevSibling = parent.child(indexInParent - 1);
    const targetPos = listItemPos - prevSibling.nodeSize;
    const slice = tr.doc.slice(listItemPos, listItemEnd);
    tr.delete(listItemPos, listItemEnd);
    tr.insert(targetPos, slice.content);
    try {
      tr.setSelection(TextSelection.create(tr.doc, targetPos + 1));
    } catch {
      tr.setSelection(TextSelection.near(tr.doc.resolve(targetPos + 1)));
    }
  } else {
    const nextSibling = parent.child(indexInParent + 1);
    const insertPos = listItemPos + nextSibling.nodeSize;
    const slice = tr.doc.slice(listItemPos, listItemEnd);
    tr.delete(listItemPos, listItemEnd);
    tr.insert(insertPos, slice.content);
    try {
      tr.setSelection(TextSelection.create(tr.doc, insertPos + 1));
    } catch {
      tr.setSelection(TextSelection.near(tr.doc.resolve(insertPos + 1)));
    }
  }

  view.dispatch(tr);
}

// Custom extension to detect space on empty line
const SpaceCommand = Extension.create({
  name: 'spaceCommand',

  addKeyboardShortcuts() {
    return {
      ' ': ({ editor }) => {
        const { state } = editor;
        const { selection, doc } = state;
        const { $from } = selection;

        // Check if we're at the start of an empty paragraph
        const isAtStart = $from.parentOffset === 0;
        const parentNode = $from.parent;
        const isEmptyParagraph = parentNode.type.name === 'paragraph' && parentNode.content.size === 0;

        if (isAtStart && isEmptyParagraph) {
          // Trigger the space menu
          const event = new CustomEvent('show-space-menu', {
            detail: { pos: $from.pos }
          });
          window.dispatchEvent(event);
          return true;
        }

        return false;
      },
    };
  },
});

export default function TipTapEditor({
  onStateChange,
  onCommandExecuted,
  pendingCommand,
  initialContent = '',
  onContentChange,
}: EditorProps) {
  const lastCommandId = useRef<string | null>(null);
  const initialContentRef = useRef(initialContent);
  const [showSpaceMenu, setShowSpaceMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [selectedIndex, setSelectedIndex] = useState(0);

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
      SpaceCommand,
    ],
    content: initialContentRef.current,
    onUpdate: ({ editor }) => {
      onStateChange(extractEditorState(editor));
      if (onContentChange) {
        onContentChange(editor.getHTML());
      }
      setShowSpaceMenu(false);
    },
    onSelectionUpdate: ({ editor }) => {
      onStateChange(extractEditorState(editor));
    },
  });

  // Listen for space menu trigger
  useEffect(() => {
    const handleShowSpaceMenu = (e: CustomEvent) => {
      if (editor) {
        const { view } = editor;
        const coords = view.coordsAtPos(e.detail.pos);
        setMenuPosition({
          top: coords.top - 48,
          left: coords.left,
        });
        setSelectedIndex(0);
        setShowSpaceMenu(true);
      }
    };

    window.addEventListener('show-space-menu', handleShowSpaceMenu as EventListener);
    return () => {
      window.removeEventListener('show-space-menu', handleShowSpaceMenu as EventListener);
    };
  }, [editor]);

  // Close menu on click outside
  useEffect(() => {
    const handleClick = () => setShowSpaceMenu(false);
    if (showSpaceMenu) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [showSpaceMenu]);

  // Handle keyboard navigation for space menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showSpaceMenu) return;

      if (e.key === 'Escape') {
        setShowSpaceMenu(false);
        editor?.commands.focus();
      } else if (e.key === 'Tab') {
        e.preventDefault();
        if (e.shiftKey) {
          setSelectedIndex((prev) => (prev - 1 + spaceMenuCommands.length) % spaceMenuCommands.length);
        } else {
          setSelectedIndex((prev) => (prev + 1) % spaceMenuCommands.length);
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (editor) {
          spaceMenuCommands[selectedIndex].command(editor);
          setShowSpaceMenu(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSpaceMenu, selectedIndex, editor]);

  const handleSpaceMenuCommand = useCallback((cmd: SpaceMenuCommand) => {
    if (editor) {
      cmd.command(editor);
      setShowSpaceMenu(false);
    }
  }, [editor]);

  useEffect(() => {
    if (!editor || !pendingCommand) return;
    if (pendingCommand.id === lastCommandId.current) return;

    executeCommand(editor, pendingCommand.command);
    lastCommandId.current = pendingCommand.id;
    onCommandExecuted();
  }, [editor, pendingCommand, onCommandExecuted]);

  useEffect(() => {
    if (editor) {
      onStateChange(extractEditorState(editor));
    }
  }, [editor, onStateChange]);

  return (
    <div className="editor-container">
      {/* Space Command Menu */}
      {showSpaceMenu && (
        <div
          className="fixed flex flex-row gap-0.5 p-1 rounded-lg bg-neutral-900 border border-neutral-700 shadow-lg z-50"
          style={{
            top: menuPosition.top,
            left: menuPosition.left,
          }}
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          {spaceMenuCommands.map((cmd, index) => (
            <button
              key={cmd.title}
              className={`flex items-center justify-center w-9 h-9 rounded-md text-sm font-medium transition-colors ${
                index === selectedIndex
                  ? 'bg-blue-500 text-white'
                  : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
              }`}
              onClick={() => handleSpaceMenuCommand(cmd)}
              title={cmd.title}
            >
              {cmd.icon}
            </button>
          ))}
        </div>
      )}

      <EditorContent editor={editor} className="editor-content" />
    </div>
  );
}
