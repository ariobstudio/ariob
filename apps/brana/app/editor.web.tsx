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
import { createPortal } from 'react-dom';
import type { Editor } from '@tiptap/react';
import { BubbleMenuPlugin } from '@tiptap/extension-bubble-menu';

// Shared utilities
import { extractEditorState, executeCommand } from '../utils/editor';
import { getRandomPlaceholder } from '../constants/placeholders';
import { blockCommands, inlineCommands, listCommands, type MenuCommand } from '../constants/menuCommands';
import type { EditorState, PendingCommand } from '../types/editor';

// Hooks
import { useBlockInfo } from '../hooks';
import { clampMenuPosition } from '../hooks/useMenuPosition';

// Components
import { BlockIndicator } from '../components/indicators';
import { BlockMenu } from '../components/menus';
import { Icon } from '../components/icons';

interface EditorProps {
  onStateChange: (state: EditorState) => Promise<void>;
  onCommandExecuted: () => Promise<void>;
  pendingCommand: PendingCommand | null;
  initialContent?: string;
  onContentChange?: (content: string) => void;
  onCreateNewPaper?: () => void;
  onNavigate?: (screen: 'archive' | 'settings') => void;
  onNavigatePaper?: (direction: 'prev' | 'next') => void;
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
  onCreateNewPaper,
  onNavigate,
  onNavigatePaper,
}: EditorProps) {
  const lastCommandId = useRef<string | null>(null);
  const initialContentRef = useRef(initialContent);
  const blockMenuRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Bubble menu element ref (for selection formatting via BubbleMenuPlugin)
  const bubbleMenuElement = useRef<HTMLDivElement | null>(null);
  const [bubbleMenuMounted, setBubbleMenuMounted] = useState(false);
  const [bubbleMenuVisible, setBubbleMenuVisible] = useState(false);
  const [bubbleSelectedIndex, setBubbleSelectedIndex] = useState(0);

  // Block menu state
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showAllBlocks, setShowAllBlocks] = useState(false); // For "back to main" functionality

  const placeholder = useMemo(() => getRandomPlaceholder(), []);

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
    immediatelyRender: true,
    shouldRerenderOnTransaction: false,
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
      const { selection } = editor.state;
      const hasSelection = !selection.empty && selection.from !== selection.to;

      // Track bubble menu visibility for keyboard navigation
      if (hasSelection) {
        if (!bubbleMenuVisible) {
          setBubbleSelectedIndex(0); // Reset index when menu appears
        }
        setBubbleMenuVisible(true);
        // Hide block menu when text is selected (bubble menu will show instead)
        setShowBlockMenu(false);
        setShowAllBlocks(false);
      } else {
        setBubbleMenuVisible(false);
      }
    },
  });

  // Use the blockInfo hook for accurate positioning
  const blockInfo = useBlockInfo(editor, containerRef);

  // Register BubbleMenuPlugin for selection formatting
  useEffect(() => {
    if (!editor || editor.isDestroyed) {
      return;
    }

    // Create a detached element for the bubble menu
    const element = document.createElement('div');
    element.className = 'bubble-menu-wrapper';
    element.style.visibility = 'hidden';
    element.style.position = 'absolute';
    bubbleMenuElement.current = element;

    // Register the BubbleMenuPlugin
    const plugin = BubbleMenuPlugin({
      pluginKey: 'bubbleMenu',
      editor,
      element,
      updateDelay: 0,
      shouldShow: ({ state }) => {
        const { selection } = state;
        const { empty, from, to } = selection;
        // Show only when text is selected (not empty selection)
        return !empty && from !== to;
      },
      options: {
        placement: 'top',
        offset: { mainAxis: 8 }, // 8px gap above selection
        flip: true,
        shift: { padding: 8 },
      },
    });

    editor.registerPlugin(plugin);
    setBubbleMenuMounted(true);

    return () => {
      editor.unregisterPlugin('bubbleMenu');
      setBubbleMenuMounted(false);
      // Clean up the element
      requestAnimationFrame(() => {
        if (bubbleMenuElement.current?.parentNode) {
          bubbleMenuElement.current.parentNode.removeChild(bubbleMenuElement.current);
        }
        bubbleMenuElement.current = null;
      });
    };
  }, [editor]);

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
          // Shift+Arrow should extend selection, not navigate menu
          if (e.shiftKey) return;
          e.preventDefault();
          e.stopPropagation();
          setSelectedIndex(prev => (prev + 1) % commands.length);
          break;

        case 'ArrowLeft':
          // Shift+Arrow should extend selection, not navigate menu
          if (e.shiftKey) return;
          e.preventDefault();
          e.stopPropagation();
          setSelectedIndex(prev => (prev - 1 + commands.length) % commands.length);
          break;

        case 'ArrowUp':
        case 'ArrowDown':
          // Shift+Arrow should extend selection, not navigate menu
          // Also allow Up/Down to extend selection vertically
          if (e.shiftKey) return;
          break;

        case 'Home':
          // Shift+Home should extend selection to start
          if (e.shiftKey) return;
          e.preventDefault();
          e.stopPropagation();
          setSelectedIndex(0);
          break;

        case 'End':
          // Shift+End should extend selection to end
          if (e.shiftKey) return;
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

  // Keyboard navigation for bubble menu (selection formatting)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!bubbleMenuVisible || !editor) return;
      // Don't handle if block menu is open
      if (showBlockMenu) return;

      const commands = inlineCommands;

      switch (e.key) {
        case 'ArrowRight':
          // Shift+Arrow should extend selection, not navigate menu
          if (e.shiftKey) return;
          e.preventDefault();
          e.stopPropagation();
          setBubbleSelectedIndex(prev => (prev + 1) % commands.length);
          break;

        case 'ArrowLeft':
          // Shift+Arrow should extend selection, not navigate menu
          if (e.shiftKey) return;
          e.preventDefault();
          e.stopPropagation();
          setBubbleSelectedIndex(prev => (prev - 1 + commands.length) % commands.length);
          break;

        case 'ArrowUp':
        case 'ArrowDown':
          // Shift+Arrow should extend selection vertically
          if (e.shiftKey) return;
          break;

        case 'Home':
          // Shift+Home should extend selection to start
          if (e.shiftKey) return;
          e.preventDefault();
          e.stopPropagation();
          setBubbleSelectedIndex(0);
          break;

        case 'End':
          // Shift+End should extend selection to end
          if (e.shiftKey) return;
          e.preventDefault();
          e.stopPropagation();
          setBubbleSelectedIndex(commands.length - 1);
          break;

        case 'Tab':
          // Tab cycles through menu items (Shift+Tab goes backwards)
          e.preventDefault();
          e.stopPropagation();
          if (e.shiftKey) {
            setBubbleSelectedIndex(prev => (prev - 1 + commands.length) % commands.length);
          } else {
            setBubbleSelectedIndex(prev => (prev + 1) % commands.length);
          }
          break;

        case 'Enter':
          if (bubbleSelectedIndex >= 0) {
            e.preventDefault();
            e.stopPropagation();
            const cmd = commands[bubbleSelectedIndex];
            if (cmd) {
              handleInlineCommand(cmd);
            }
          }
          break;

        case 'Escape':
          e.preventDefault();
          e.stopPropagation();
          // Clear selection to hide bubble menu
          editor.commands.setTextSelection(editor.state.selection.from);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [bubbleMenuVisible, bubbleSelectedIndex, editor, showBlockMenu, handleInlineCommand]);

  // Global keyboard shortcuts (Cmd/Ctrl + key)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (!editor) return;

      const isMeta = e.metaKey || e.ctrlKey;
      if (!isMeta) return;

      // Cmd + O: Create new paper
      if (e.key === 'o') {
        e.preventDefault();
        onCreateNewPaper?.();
        return;
      }

      // Cmd + 9: Previous paper
      if (e.key === '9') {
        e.preventDefault();
        onNavigatePaper?.('prev');
        return;
      }

      // Cmd + 0: Next paper
      if (e.key === '0') {
        e.preventDefault();
        onNavigatePaper?.('next');
        return;
      }

      // Cmd + .: Toggle checkbox
      if (e.key === '.') {
        e.preventDefault();
        executeCommand(editor, { type: 'toggleTaskList' });
        return;
      }

      // Cmd + Shift + .: Remove checkbox (convert to paragraph)
      if (e.key === '>') {
        e.preventDefault();
        if (editor.isActive('taskList')) {
          executeCommand(editor, { type: 'setParagraph' });
        }
        return;
      }

      // Cmd + 5: Toggle strikethrough
      if (e.key === '5') {
        e.preventDefault();
        executeCommand(editor, { type: 'toggleStrike' });
        return;
      }

      // Cmd + Enter: Insert line below
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        editor.chain().focus().setHardBreak().run();
        return;
      }

      // Cmd + Shift + Enter: Insert line above
      if (e.key === 'Enter' && e.shiftKey) {
        e.preventDefault();
        const { $from } = editor.state.selection;
        const lineStart = $from.start();
        editor.chain()
          .focus()
          .setTextSelection(lineStart)
          .setHardBreak()
          .setTextSelection(lineStart)
          .run();
        return;
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [editor, onCreateNewPaper, onNavigatePaper]);

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

  // Calculate block menu position - below the block indicator (mindful pattern)
  const clampedBlockMenuPosition = useMemo(() => {
    const menuHeight = 52;
    const menuWidth = contextCommands.length * 46; // 42px button + 4px gap
    const indicatorHeight = 20; // Height of block indicator dots

    // Position below the indicator (which is 20px above the block)
    // Adding indicatorHeight places the menu at the block's top position
    const rawPosition = {
      top: (blockInfo ? blockInfo.position.top + indicatorHeight : menuPosition.top),
      left: (blockInfo ? blockInfo.position.left : menuPosition.left),
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

      {/* Selection Menu - BubbleMenuPlugin with portal rendering */}
      {bubbleMenuMounted && bubbleMenuElement.current && createPortal(
        <div className="block-menu__icons" role="toolbar" aria-label="Text formatting options">
          {inlineCommands.map((cmd, index) => {
            const isActive = editor ? isInlineActive(editor, cmd.id) : false;
            const isSelected = index === bubbleSelectedIndex;
            return (
              <button
                key={cmd.id}
                className="block-menu__icon"
                data-active={isActive}
                data-selected={isSelected}
                tabIndex={isSelected ? 0 : -1}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleInlineCommand(cmd);
                }}
                onMouseEnter={() => setBubbleSelectedIndex(index)}
                title={cmd.title}
                aria-label={cmd.title}
                aria-pressed={isActive}
              >
                <Icon name={cmd.iconName} variant={cmd.iconVariant} size="md" />
              </button>
            );
          })}
        </div>,
        bubbleMenuElement.current
      )}

      {/* Screen reader announcements */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {showBlockMenu && `Block menu open. ${contextCommands.length} options available. Use arrow keys to navigate.`}
        {bubbleMenuVisible && `Formatting menu open. ${inlineCommands.length} options available. Use arrow keys to navigate.`}
      </div>

      {/* Web Navigation Icons - using FontAwesome CSS classes */}
      <nav className="web-nav web-nav--left" aria-label="Quick actions">
        <button
          className="web-nav__button"
          onClick={() => onCreateNewPaper?.()}
          aria-label="New paper"
          title="New paper"
        >
          <i className="fa-solid fa-file" />
        </button>
        <button
          className="web-nav__button"
          onClick={() => onNavigate?.('archive')}
          aria-label="Archive"
          title="Archive"
        >
          <i className="fa-solid fa-box-archive" />
        </button>
      </nav>
      <nav className="web-nav web-nav--right" aria-label="Settings">
        <button
          className="web-nav__button"
          onClick={() => onNavigate?.('settings')}
          aria-label="Settings"
          title="Settings"
        >
          <i className="fa-solid fa-gear" />
        </button>
      </nav>
    </div>
  );
}
