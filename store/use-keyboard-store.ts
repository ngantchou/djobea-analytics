import { create } from "zustand"

interface KeyboardState {
  isSearchOpen: boolean
  isCommandPaletteOpen: boolean
  isHelpOpen: boolean
  shortcuts: Record<string, () => void>
  openSearch: () => void
  closeSearch: () => void
  openCommandPalette: () => void
  closeCommandPalette: () => void
  openHelp: () => void
  closeHelp: () => void
  registerShortcut: (key: string, callback: () => void) => void
  unregisterShortcut: (key: string) => void
}

export const useKeyboardStore = create<KeyboardState>((set, get) => ({
  isSearchOpen: false,
  isCommandPaletteOpen: false,
  isHelpOpen: false,
  shortcuts: {},

  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),

  openCommandPalette: () => set({ isCommandPaletteOpen: true }),
  closeCommandPalette: () => set({ isCommandPaletteOpen: false }),

  openHelp: () => set({ isHelpOpen: true }),
  closeHelp: () => set({ isHelpOpen: false }),

  registerShortcut: (key: string, callback: () => void) =>
    set((state) => ({
      shortcuts: { ...state.shortcuts, [key]: callback },
    })),

  unregisterShortcut: (key: string) =>
    set((state) => {
      const { [key]: _, ...rest } = state.shortcuts
      return { shortcuts: rest }
    }),
}))
