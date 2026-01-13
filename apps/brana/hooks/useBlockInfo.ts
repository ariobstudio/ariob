/**
 * Hook for tracking block position and context using TipTap NodePos API
 * Provides accurate position tracking that respects document scrolling
 */
import { useEffect, useState, useCallback, RefObject, useRef } from 'react';
import type { Editor } from '@tiptap/react';

export interface BlockInfo {
  isEmpty: boolean;
  isInList: boolean;
  isTaskList: boolean;
  position: { top: number; left: number };
  nodePos: number; // Document position of the block
  blockType: string; // Type of block (paragraph, heading, blockquote, etc.)
}

/** Block-level element tag names we recognize */
const BLOCK_ELEMENTS = new Set([
  'P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
  'LI', 'UL', 'OL',
  'BLOCKQUOTE', 'PRE', 'HR', 'DIV'
]);

/**
 * Helper to check if two BlockInfo objects are equal
 */
function blockInfoEqual(a: BlockInfo | null, b: BlockInfo | null): boolean {
  if (a === null && b === null) return true;
  if (a === null || b === null) return false;
  return (
    a.isEmpty === b.isEmpty &&
    a.isInList === b.isInList &&
    a.isTaskList === b.isTaskList &&
    Math.abs(a.position.top - b.position.top) < 1 &&
    Math.abs(a.position.left - b.position.left) < 1 &&
    a.nodePos === b.nodePos &&
    a.blockType === b.blockType
  );
}

/**
 * Find the block-level DOM element starting from a given element
 * Walks up the tree until finding a block element or reaching ProseMirror container
 */
function findBlockElement(element: Element | null): Element | null {
  let current = element;
  
  while (current) {
    // Stop if we hit the ProseMirror container
    if (current.classList?.contains('ProseMirror')) {
      return null;
    }
    
    // Check if this is a block-level element
    if (BLOCK_ELEMENTS.has(current.nodeName)) {
      return current;
    }
    
    current = current.parentElement;
  }
  
  return null;
}

/**
 * Get block information using NodePos API for accurate positioning
 */
export function useBlockInfo(
  editor: Editor | null,
  containerRef?: RefObject<HTMLDivElement | null>
): BlockInfo | null {
  const [blockInfo, setBlockInfo] = useState<BlockInfo | null>(null);
  const prevBlockInfoRef = useRef<BlockInfo | null>(null);

  const updateBlockInfo = useCallback(() => {
    if (!editor) {
      if (prevBlockInfoRef.current !== null) {
        setBlockInfo(null);
        prevBlockInfoRef.current = null;
      }
      return;
    }

    const { state, view } = editor;
    const { selection } = state;
    const { $from } = selection;

    let isInList = false;
    let isTaskList = false;
    let listDepth = 0;

    // Check if in list (including taskList) using NodePos
    for (let depth = $from.depth; depth > 0; depth--) {
      const node = $from.node(depth);
      const nodeName = node.type.name;
      if (nodeName === 'bulletList' || nodeName === 'orderedList' || nodeName === 'taskList') {
        isInList = true;
        isTaskList = nodeName === 'taskList';
        listDepth = depth;
        break;
      }
    }

    const parentNode = $from.parent;
    const isEmpty = parentNode.content.size === 0;

    // Use $from.start() to get a position INSIDE the current block
    // This is more reliable than $from.before() which can return edge positions
    const posInsideBlock = $from.depth > 0 ? $from.start($from.depth) : $from.pos;

    try {
      // Get the DOM element at this position
      const domAtPos = view.domAtPos(posInsideBlock);
      let element: Element | null = domAtPos.node as Element;

      // If it's a text node, get its parent element
      if (element.nodeType === Node.TEXT_NODE) {
        element = element.parentElement;
      }

      // Handle case where we get the ProseMirror container directly
      // This can happen at position 0 or at document edges
      if (element?.classList?.contains('ProseMirror')) {
        // Try to get the first child block element at the current position
        const firstChild = element.firstElementChild;
        if (firstChild && BLOCK_ELEMENTS.has(firstChild.nodeName)) {
          element = firstChild;
        } else {
          // Fallback: try using coordsAtPos to find the element
          const coords = view.coordsAtPos($from.pos);
          const elementAtPoint = document.elementFromPoint(coords.left, coords.top);
          element = findBlockElement(elementAtPoint);
        }
      }

      // Find the block-level element
      let blockElement = findBlockElement(element);

      if (!blockElement) {
        if (prevBlockInfoRef.current !== null) {
          setBlockInfo(null);
          prevBlockInfoRef.current = null;
        }
        return;
      }

      // For lists, use the UL/OL element for the indicator position
      if (isInList && (blockElement.nodeName === 'LI' || blockElement.nodeName === 'P')) {
        // Walk up to find the list container
        let listElement: Element | null = blockElement;
        while (listElement && !listElement.classList?.contains('ProseMirror')) {
          if (listElement.nodeName === 'UL' || listElement.nodeName === 'OL') {
            blockElement = listElement;
            break;
          }
          listElement = listElement.parentElement;
        }
      }

      // Determine block type from the ProseMirror node
      const blockType = parentNode.type.name;

      // Use getBoundingClientRect for accurate positioning with scroll
      const rect = blockElement.getBoundingClientRect();

      // Get container position to calculate relative offset (for position: absolute)
      const container = containerRef?.current;
      const containerRect = container?.getBoundingClientRect();

      if (!containerRect) {
        if (prevBlockInfoRef.current !== null) {
          setBlockInfo(null);
          prevBlockInfoRef.current = null;
        }
        return;
      }

      // Calculate position relative to container - ABOVE the block element
      // Position indicator on top of the block (above it, not to the left)
      const indicatorHeight = 20; // Height of the indicator element
      const relativeTop = rect.top - containerRect.top - indicatorHeight;
      // Align horizontally with the start of the block content
      const relativeLeft = rect.left - containerRect.left;

      const newBlockInfo: BlockInfo = {
        isEmpty,
        isInList,
        isTaskList,
        position: { top: relativeTop, left: relativeLeft },
        nodePos: posInsideBlock,
        blockType,
      };

      // Only update if values have changed
      if (!blockInfoEqual(prevBlockInfoRef.current, newBlockInfo)) {
        setBlockInfo(newBlockInfo);
        prevBlockInfoRef.current = newBlockInfo;
      }
    } catch {
      if (prevBlockInfoRef.current !== null) {
        setBlockInfo(null);
        prevBlockInfoRef.current = null;
      }
    }
  }, [editor, containerRef]);

  // Update on selection or content changes
  useEffect(() => {
    if (!editor) return;

    updateBlockInfo();

    const handleUpdate = () => updateBlockInfo();

    editor.on('selectionUpdate', handleUpdate);
    editor.on('update', handleUpdate);

    return () => {
      editor.off('selectionUpdate', handleUpdate);
      editor.off('update', handleUpdate);
    };
  }, [editor, updateBlockInfo]);

  return blockInfo;
}
