/** Menu state management */

import { create } from 'zustand';
import type { Act } from './types';

/** Node data for context menu */
export interface NodeRef {
  id: string;
  type: string;
  author?: string;
}

/** Menu state */
interface MenuState {
  open: boolean;
  node: NodeRef | null;
  pos: { x: number; y: number } | null;
}

/** Menu actions */
interface MenuActions {
  show: (node: NodeRef, pos?: { x: number; y: number }) => void;
  hide: () => void;
  toggle: () => void;
}

/** Menu store */
export const useMenu = create<MenuState & MenuActions>((set) => ({
  open: false,
  node: null,
  pos: null,

  show: (node, pos) => set({ open: true, node, pos }),
  hide: () => set({ open: false, node: null, pos: null }),
  toggle: () => set((s) => ({ open: !s.open })),
}));

/** Get menu state */
export function useMenuOpen() {
  return useMenu((s) => s.open);
}

/** Get focused node */
export function useMenuNode() {
  return useMenu((s) => s.node);
}
