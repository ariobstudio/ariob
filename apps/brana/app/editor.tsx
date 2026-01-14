"use dom";
import '../global.web.css';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useRef, useMemo } from 'react';

// Shared utilities
import { extractEditorState, executeCommand } from '../utils/editor';
import { getRandomPlaceholder } from '../constants/placeholders';
import type { EditorState, PendingCommand } from '../types/editor';

interface EditorProps {
  onStateChange: (state: EditorState) => void;
  onCommandExecuted: () => void;
  pendingCommand: PendingCommand | null;
  initialContent?: string;
  onContentChange?: (content: string) => void;
  onCreateNewPaper?: () => void;
  onNavigate?: (screen: 'archive' | 'settings') => void;
  onNavigatePaper?: (direction: 'prev' | 'next') => void;
  dom?: import('expo/dom').DOMProps;
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
  const placeholder = useMemo(() => getRandomPlaceholder(), []);

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
    immediatelyRender: true,
    shouldRerenderOnTransaction: false,
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
