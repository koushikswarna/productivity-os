import { create } from 'zustand'

interface UIState {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  commandOpen: boolean
  setCommandOpen: (open: boolean) => void
  activeModal: string | null
  setActiveModal: (modal: string | null) => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  commandOpen: false,
  setCommandOpen: (open) => set({ commandOpen: open }),
  activeModal: null,
  setActiveModal: (modal) => set({ activeModal: modal }),
}))
