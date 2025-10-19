/**
 * useDragWithIntersection Hook
 *
 * MTS-based drag hook using Intersection Observer for drop target detection.
 * Provides chess.com-style drag interactions with 60fps performance.
 *
 * Instead of manual coordinate calculation, uses IntersectionObserver to detect
 * when the dragged element overlaps with drop targets.
 */

import { useState, useCallback, useRef } from '@lynx-js/react';

const DRAG_THRESHOLD = 8;

export interface DragState<T = any> {
  isDragging: boolean;
  item: T | null;
  startId: string | null;
  currentX: number;
  currentY: number;
  offsetX: number;
  offsetY: number;
  hoveredTargetId: string | null;
}

export interface UseDragWithIntersectionOptions {
  dragThreshold?: number;
  onDragActivate?: () => void;
}

/**
 * Hook for drag and drop with intersection-based target detection.
 *
 * @param options Configuration for drag behavior
 * @returns Drag state and event handlers
 *
 * @example
 * ```typescript
 * const { dragState, startDrag, updateDrag, endDrag } = useDragWithIntersection();
 *
 * <view
 *   bindtouchstart={(e) => startDrag('piece-1', pieceData, e)}
 *   bindtouchmove={updateDrag}
 *   bindtouchend={() => endDrag(handleDrop)}
 * />
 * ```
 */
export function useDragWithIntersection<T = any>(
  options: UseDragWithIntersectionOptions = {}
) {
  const { dragThreshold = DRAG_THRESHOLD, onDragActivate } = options;

  // Refs for drag tracking
  const isDraggingRef = useRef(false);
  const touchStartedRef = useRef(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const currentXRef = useRef(0);
  const currentYRef = useRef(0);
  const offsetXRef = useRef(0);
  const offsetYRef = useRef(0);
  const startIdRef = useRef<string | null>(null);
  const itemRef = useRef<T | null>(null);
  const hoveredTargetIdRef = useRef<string | null>(null);
  const dragActivateCallbackRef = useRef<(() => void) | null>(null);

  // State for triggering re-renders
  const [dragState, setDragState] = useState<DragState<T>>({
    isDragging: false,
    item: null,
    startId: null,
    currentX: 0,
    currentY: 0,
    offsetX: 0,
    offsetY: 0,
    hoveredTargetId: null,
  });

  /**
   * Set the currently hovered drop target
   * Called by external intersection observer
   */
  const setHoveredTarget = useCallback((targetId: string | null) => {
    hoveredTargetIdRef.current = targetId;
    setDragState((prev) => ({ ...prev, hoveredTargetId: targetId }));
  }, []);

  /**
   * Start drag operation
   * Handler for touchstart
   */
  const startDrag = useCallback(
    (
      startId: string,
      item: T,
      event: any,
      elementRect: { x: number; y: number; width: number; height: number },
      onActivate?: () => void
    ) => {
      // Extract touch coordinates from Lynx event
      let touchX = 0;
      let touchY = 0;

      if (event.touches && event.touches[0]) {
        touchX = event.touches[0].clientX || event.touches[0].pageX;
        touchY = event.touches[0].clientY || event.touches[0].pageY;
      } else if (event.detail) {
        touchX = event.detail.x || event.detail.clientX;
        touchY = event.detail.y || event.detail.clientY;
      }

      console.log('[useDragWithIntersection] startDrag - touchX:', touchX, 'touchY:', touchY, 'elementRect.x:', elementRect.x, 'elementRect.y:', elementRect.y, 'elementRect.width:', elementRect.width, 'elementRect.height:', elementRect.height);

      // Calculate offset from element top-left corner
      const offsetX = touchX - elementRect.x;
      const offsetY = touchY - elementRect.y;

      console.log('[useDragWithIntersection] Calculated offset - offsetX:', offsetX, 'offsetY:', offsetY, 'squareSize:', elementRect.width, 'offset should be within 0-', elementRect.width);

      // Record initial touch state
      touchStartedRef.current = true;
      isDraggingRef.current = false;
      startXRef.current = touchX;
      startYRef.current = touchY;
      currentXRef.current = touchX;
      currentYRef.current = touchY;
      offsetXRef.current = offsetX;
      offsetYRef.current = offsetY;

      // Store item and ID
      startIdRef.current = startId;
      itemRef.current = item;
      dragActivateCallbackRef.current = onActivate || onDragActivate || null;
    },
    [onDragActivate]
  );

  /**
   * Update drag position
   * Handler for touchmove
   */
  const updateDrag = useCallback(
    (event: any) => {
      if (!touchStartedRef.current) return;

      // Extract touch coordinates from Lynx event
      let currentX = 0;
      let currentY = 0;

      if (event.touches && event.touches[0]) {
        // Standard touch event
        currentX = event.touches[0].clientX || event.touches[0].pageX;
        currentY = event.touches[0].clientY || event.touches[0].pageY;
      } else if (event.detail) {
        // Lynx detail event
        currentX = event.detail.x || event.detail.clientX;
        currentY = event.detail.y || event.detail.clientY;
      } else if (event.changedTouches && event.changedTouches[0]) {
        // Changed touches fallback
        currentX = event.changedTouches[0].clientX || event.changedTouches[0].pageX;
        currentY = event.changedTouches[0].clientY || event.changedTouches[0].pageY;
      }

      console.log('[useDragWithIntersection] updateDrag - currentX:', currentX, 'currentY:', currentY, 'distance:', Math.sqrt((currentX - startXRef.current) ** 2 + (currentY - startYRef.current) ** 2));

      currentXRef.current = currentX;
      currentYRef.current = currentY;

      // Calculate distance moved
      const deltaX = currentX - startXRef.current;
      const deltaY = currentY - startYRef.current;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Activate drag after exceeding threshold
      if (!isDraggingRef.current && distance > dragThreshold) {
        isDraggingRef.current = true;

        // Call activation callback
        if (dragActivateCallbackRef.current) {
          dragActivateCallbackRef.current();
          dragActivateCallbackRef.current = null;
        }

        // Activate drag visuals
        setDragState({
          isDragging: true,
          item: itemRef.current,
          startId: startIdRef.current,
          currentX,
          currentY,
          offsetX: offsetXRef.current,
          offsetY: offsetYRef.current,
          hoveredTargetId: hoveredTargetIdRef.current,
        });
      } else if (isDraggingRef.current) {
        // Already dragging, just update position
        setDragState((prev) => ({
          ...prev,
          currentX,
          currentY,
        }));
      }
    },
    [dragThreshold]
  );

  /**
   * End drag operation
   * Returns the hovered target ID for drop handling
   */
  const endDrag = useCallback(
    (onDrop?: (startId: string, targetId: string) => boolean) => {
      // Reset touch tracking
      touchStartedRef.current = false;
      dragActivateCallbackRef.current = null;

      const wasDragging = isDraggingRef.current;
      const startId = startIdRef.current;
      const hoveredTarget = hoveredTargetIdRef.current;

      if (!wasDragging || !startId) {
        // Was a tap, not a drag
        isDraggingRef.current = false;
        startIdRef.current = null;
        itemRef.current = null;
        hoveredTargetIdRef.current = null;

        setDragState({
          isDragging: false,
          item: null,
          startId: null,
          currentX: 0,
          currentY: 0,
          offsetX: 0,
          offsetY: 0,
          hoveredTargetId: null,
        });
        return;
      }

      // Attempt drop if we have a target
      if (hoveredTarget && onDrop) {
        onDrop(startId, hoveredTarget);
      }

      // Reset drag state
      isDraggingRef.current = false;
      startIdRef.current = null;
      itemRef.current = null;
      hoveredTargetIdRef.current = null;

      setDragState({
        isDragging: false,
        item: null,
        startId: null,
        currentX: 0,
        currentY: 0,
        offsetX: 0,
        offsetY: 0,
        hoveredTargetId: null,
      });
    },
    []
  );

  return {
    dragState,
    startDrag,
    updateDrag,
    endDrag,
    setHoveredTarget,
  };
}

export default useDragWithIntersection;
