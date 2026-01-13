"use dom";
import '../global.web.css';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Placeholder from '@tiptap/extension-placeholder';
import { Extension } from '@tiptap/core';
import React, { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import type { Editor } from '@tiptap/react';

// Shared utilities
import { extractEditorState, executeCommand } from '../utils/editor';
import { getRandomPlaceholder } from '../constants/placeholders';
import { blockCommands, inlineCommands, listCommands, type MenuCommand } from '../constants/menuCommands';
import type { EditorState, PendingCommand } from '../types/editor';

// Hooks
import { useBlockInfo, type BlockInfo } from '../hooks';
import { clampMenuPosition } from '../hooks/useMenuPosition';

// Components
import { BlockIndicator } from '../components/indicators';
import { BlockMenu, SelectionMenu } from '../components/menus';

interface EditorProps {
  onStateChange: (state: EditorState) => Promise<void>;
  onCommandExecuted: () => Promise<void>;
  pendingCommand: PendingCommand | null;
  initialContent?: string;
  onContentChange?: (content: string) => void;
  dom?: import('expo/dom').DOMProps;
}


// Keyboard shortcuts extension
const KeyboardShortcuts = Extension.create({
  name: 'keyboardShortcuts',

  addKeyboardShortcuts() {
    return {
      // Space on empty block shows menu
      ' ': ({ editor }) => {
        const { state } = editor;
        const { selection } = state;
        const { $from } = selection;

        const isAtStart = $from.parentOffset === 0;
        const parentNode = $from.parent;
        const isEmpty = parentNode.content.size === 0;

        if (isAtStart && isEmpty) {
          const event = new CustomEvent('show-block-menu', {
            detail: { pos: $from.pos }
          });
          window.dispatchEvent(event);
          return true;
        }
        return false;
      },
      // Shift+Space: show block menu on any block
      'Shift- ': ({ editor }) => {
        const { state } = editor;
        const { $from } = state.selection;
        window.dispatchEvent(new CustomEvent('show-block-menu', { detail: { pos: $from.pos } }));
        return true;
      },
      // Alt+ArrowUp: move list item up
      'Alt-ArrowUp': ({ editor }) => {
        if (editor.isActive('listItem') || editor.isActive('taskItem')) {
          executeCommand(editor, { type: 'moveUp' });
          return true;
        }
        return false;
      },
      // Alt+ArrowDown: move list item down
      'Alt-ArrowDown': ({ editor }) => {
        if (editor.isActive('listItem') || editor.isActive('taskItem')) {
          executeCommand(editor, { type: 'moveDown' });
          return true;
        }
        return false;
      },
      // Tab: indent list item
      'Tab': ({ editor }) => {
        if (editor.isActive('listItem') || editor.isActive('taskItem')) {
          executeCommand(editor, { type: 'indent' });
          return true;
        }
        return false;
      },
      // Shift+Tab: outdent list item
      'Shift-Tab': ({ editor }) => {
        if (editor.isActive('listItem') || editor.isActive('taskItem')) {
          executeCommand(editor, { type: 'outdent' });
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
  const blockMenuRef = useRef<HTMLDivElement>(null);
  const selectionMenuRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Block menu state
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showAllBlocks, setShowAllBlocks] = useState(false); // For "back to main" functionality

  // Selection menu state
  const [showSelectionMenu, setShowSelectionMenu] = useState(false);
  const [selectionMenuPosition, setSelectionMenuPosition] = useState({ top: 0, left: 0 });
  const [selectionSelectedIndex, setSelectionSelectedIndex] = useState(0);

  const placeholder = useMemo(() => getRandomPlaceholder(), []);

  // Update selection menu position - using coordsAtPos for accurate positioning
  const updateSelectionMenuPosition = useCallback((editor: Editor) => {
    const { state, view } = editor;
    const { selection } = state;
    const { empty, from, to } = selection;

    if (!empty && from !== to) {
      try {
        if (!containerRef.current) {
          setShowSelectionMenu(false);
          return;
        }

        // Use coordsAtPos for precise selection start/end coordinates
        const startCoords = view.coordsAtPos(from);
        const endCoords = view.coordsAtPos(to);
        const containerRect = containerRef.current.getBoundingClientRect();

        const menuHeight = 52; // Match block menu height
        const menuWidth = inlineCommands.length * 46 + 8; // 42px button + 4px gap between + padding

        // Calculate position relative to container (for position: absolute)
        const selectionTop = Math.min(startCoords.top, endCoords.top);
        const selectionBottom = Math.max(startCoords.bottom, endCoords.bottom);

        // Center the menu on the selection
        const selectionCenterX = (startCoords.left + endCoords.left) / 2;

        const rawPosition = {
          top: selectionTop - containerRect.top - menuHeight - 8, // 8px above selection
          left: selectionCenterX - containerRect.left,
        };

        // Clamp position with flip-below and centerX behavior
        const clampedPos = clampMenuPosition(rawPosition, menuWidth, menuHeight, {
          flipBelow: true,
          flipAbove: true,
          originalTop: selectionBottom - containerRect.top,
          centerX: true,
        });
        setSelectionMenuPosition(clampedPos);
        setSelectionSelectedIndex(0);
        setShowSelectionMenu(true);
      } catch (error) {
        console.warn('Could not position selection menu:', error);
        setShowSelectionMenu(false);
      }
    } else {
      setShowSelectionMenu(false);
    }
  }, []);

  // Get active block type index
  const getActiveBlockIndex = useCallback((editor: Editor): number => {
    if (editor.isActive('heading', { level: 1 })) return 0;
    if (editor.isActive('heading', { level: 2 })) return 1;
    if (editor.isActive('blockquote')) return 2;
    if (editor.isActive('bulletList')) return 3;
    if (editor.isActive('taskList')) return 4;
    return -1;
  }, []);

  // Check if inline style is active
  const isInlineActive = useCallback((editor: Editor, cmdId: string): boolean => {
    if (cmdId === 'bold') return editor.isActive('bold');
    if (cmdId === 'italic') return editor.isActive('italic');
    if (cmdId === 'strike') return editor.isActive('strike');
    if (cmdId === 'link') return editor.isActive('link');
    return false;
  }, []);

  // Get active list type index (for list context menu)
  const getActiveListIndex = useCallback((editor: Editor): number => {
    if (editor.isActive('bulletList')) return 0;
    if (editor.isActive('orderedList')) return 1;
    if (editor.isActive('taskList')) return 2;
    return -1;
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'editor-link' },
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
        emptyNodeClass: 'is-empty',
      }),
      KeyboardShortcuts,
    ],
    content: initialContentRef.current,
    onUpdate: ({ editor }) => {
      onStateChange(extractEditorState(editor));
      if (onContentChange) {
        onContentChange(editor.getHTML());
      }
      // Hide menu when typing
      setShowBlockMenu(false);
    },
    onSelectionUpdate: ({ editor }) => {
      onStateChange(extractEditorState(editor));
      updateSelectionMenuPosition(editor);
    },
  });

  // Use the blockInfo hook for accurate positioning
  const blockInfo = useBlockInfo(editor, containerRef);

  // Listen for space command to show menu
  useEffect(() => {
    const handleShowMenu = (e: CustomEvent) => {
      if (editor && containerRef.current) {
        const { view } = editor;
        try {
          // Get the DOM element at this position
          const domAtPos = view.domAtPos(e.detail.pos);
          let element = domAtPos.node as Element;

          // If it's a text node, get its parent element
          if (element.nodeType === Node.TEXT_NODE) {
            element = element.parentElement!;
          }

          // Find the block-level element
          while (element && !element.classList.contains('ProseMirror')) {
            if (element.nodeName === 'P' ||
                element.nodeName === 'H1' ||
                element.nodeName === 'H2' ||
                element.nodeName === 'H3' ||
                element.nodeName === 'LI' ||
                element.nodeName === 'UL' ||
                element.nodeName === 'OL' ||
                element.nodeName === 'BLOCKQUOTE') {
              break;
            }
            element = element.parentElement!;
          }

          if (!element || element.classList.contains('ProseMirror')) {
            return;
          }

          // Use getBoundingClientRect for accurate positioning
          const rect = element.getBoundingClientRect();
          const containerRect = containerRef.current.getBoundingClientRect();

          // Calculate position relative to container (for position: absolute)
          setMenuPosition({
            top: rect.top - containerRect.top,
            left: rect.left - containerRect.left
          });
          setSelectedIndex(0);
          setShowBlockMenu(true);
        } catch {
          // If we can't find the element, don't show the menu
        }
      }
    };

    window.addEventListener('show-block-menu', handleShowMenu as EventListener);
    return () => window.removeEventListener('show-block-menu', handleShowMenu as EventListener);
  }, [editor]);

  // Get context-aware commands with "back to main" support
  const getContextCommands = useCallback((): MenuCommand[] => {
    // If "show all blocks" is active, show block commands
    if (showAllBlocks) {
      return blockCommands;
    }

    // Check if cursor is in a list by examining the editor state directly
    if (editor) {
      const { state } = editor;
      const { $from } = state.selection;

      // Walk up the node tree to check for list nodes
      for (let depth = $from.depth; depth > 0; depth--) {
        const node = $from.node(depth);
        const nodeName = node.type.name;
        if (nodeName === 'bulletList' || nodeName === 'orderedList' || nodeName === 'taskList') {
          return listCommands;
        }
      }
    }

    // Fallback to blockInfo check
    if (blockInfo?.isInList) {
      return listCommands;
    }

    return blockCommands;
  }, [blockInfo, showAllBlocks, editor]);

  const contextCommands = getContextCommands();

  // Keyboard navigation for block menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showBlockMenu || !editor) return;

      const commands = contextCommands;

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          e.stopPropagation();
          setSelectedIndex(prev => (prev + 1) % commands.length);
          break;

        case 'ArrowLeft':
          e.preventDefault();
          e.stopPropagation();
          setSelectedIndex(prev => (prev - 1 + commands.length) % commands.length);
          break;

        case 'Home':
          e.preventDefault();
          e.stopPropagation();
          setSelectedIndex(0);
          break;

        case 'End':
          e.preventDefault();
          e.stopPropagation();
          setSelectedIndex(commands.length - 1);
          break;

        case 'Tab':
          // Tab cycles through menu items (Shift+Tab goes backwards)
          e.preventDefault();
          e.stopPropagation();
          if (e.shiftKey) {
            setSelectedIndex(prev => (prev - 1 + commands.length) % commands.length);
          } else {
            setSelectedIndex(prev => (prev + 1) % commands.length);
          }
          break;

        case 'Enter':
        case ' ':
          if (selectedIndex >= 0) {
            e.preventDefault();
            e.stopPropagation();
            const cmd = commands[selectedIndex];
            if (cmd) {
              executeCommand(editor, cmd.command);
              setShowBlockMenu(false);
              editor.commands.focus();
            }
          }
          break;

        case 'Escape':
          e.preventDefault();
          e.stopPropagation();
          // If showing all blocks, go back to list commands
          if (showAllBlocks && blockInfo?.isInList) {
            setShowAllBlocks(false);
            setSelectedIndex(0);
          } else {
            setShowBlockMenu(false);
            setShowAllBlocks(false);
            editor.commands.focus();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [showBlockMenu, selectedIndex, editor, contextCommands]);


  // Close menu on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.block-menu')) {
        setShowBlockMenu(false);
        setShowAllBlocks(false); // Reset when closing menu
      }
    };
    if (showBlockMenu) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [showBlockMenu]);

  const handleBlockCommand = useCallback((cmd: MenuCommand) => {
    if (!editor) return;

    // Handle "back to main" command specially
    if (cmd.id === 'backToBlock') {
      // First convert to paragraph
      executeCommand(editor, { type: 'setParagraph' });
      // Then show all block options
      setShowAllBlocks(true);
      setSelectedIndex(0);
      return;
    }

    // Execute the command
    executeCommand(editor, cmd.command);
    setShowBlockMenu(false);
    setShowAllBlocks(false); // Reset when command is executed
    editor.commands.focus();
  }, [editor]);

  const handleInlineCommand = useCallback((cmd: MenuCommand) => {
    if (!editor) return;

    if (cmd.id === 'link') {
      if (editor.isActive('link')) {
        editor.chain().focus().unsetLink().run();
      } else {
        const url = window.prompt('Enter URL:');
        if (url) {
          editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
        }
      }
    } else {
      executeCommand(editor, cmd.command);
    }
  }, [editor]);

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

  const activeIndex = editor ? getActiveBlockIndex(editor) : -1;

  // Calculate block menu position - inline at cursor position (mindful pattern)
  const clampedBlockMenuPosition = useMemo(() => {
    const menuHeight = 52;
    const menuWidth = contextCommands.length * 46; // 42px button + 4px gap

    // Position inline at the block's position at the start
    const rawPosition = {
      top: (blockInfo ? blockInfo.position.top : menuPosition.top) - 4, // Slightly above block
      left: (blockInfo ? blockInfo.position.left : menuPosition.left), // At start of block
    };
    return clampMenuPosition(rawPosition, menuWidth, menuHeight, {
      flipBelow: false,
      flipAbove: false,
    });
  }, [blockInfo, menuPosition, contextCommands.length]);

  return (
    <div ref={containerRef} className={`editor-container ${showBlockMenu ? 'menu-open' : ''}`}>
      {/* Indicator at top of block - circular dots */}
      {blockInfo && (
        <BlockIndicator
          position={blockInfo.position}
          isActive={showBlockMenu}
        />
      )}

      {/* Block Menu - ARIA toolbar with proper keyboard navigation */}
      <BlockMenu
        isVisible={showBlockMenu}
        position={clampedBlockMenuPosition}
        commands={contextCommands}
        selectedIndex={selectedIndex}
        activeIndex={blockInfo?.isInList
          ? (editor ? getActiveListIndex(editor) : -1)
          : activeIndex}
        onCommandClick={handleBlockCommand}
        menuRef={blockMenuRef}
        ariaLabel={
          showAllBlocks
            ? "Block formatting options"
            : blockInfo?.isInList
            ? "List type options"
            : "Block formatting options"
        }
      />

      <EditorContent editor={editor} className="editor-content" />

      {/* Selection Menu - ARIA toolbar for inline formatting */}
      <SelectionMenu
        isVisible={showSelectionMenu && editor !== null}
        position={selectionMenuPosition}
        commands={inlineCommands}
        selectedIndex={selectionSelectedIndex}
        onCommandClick={handleInlineCommand}
        isCommandActive={(cmdId) => editor ? isInlineActive(editor, cmdId) : false}
        menuRef={selectionMenuRef}
      />

      {/* Screen reader announcements */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {showBlockMenu && `Block menu open. ${contextCommands.length} options available. Use arrow keys to navigate.`}
        {showSelectionMenu && `Formatting menu open. ${inlineCommands.length} options available.`}
      </div>
    </div>
  );
}
