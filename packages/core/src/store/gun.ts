import { create } from 'zustand'
import type { IGun as GunType } from '@/gun/types/gun'

interface GunState {
  gun: GunType | null
  setGun: (gun: GunType) => void
}

export const useGunStore = create<GunState>((set) => ({
  gun: null,
  setGun: (gun) => set({ gun }),
})) 