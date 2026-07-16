import { create } from "zustand"

interface DashboardState {
  sidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  tasksCompleted: number
  studyHours: number
  xpToday: number
  streak: number
  consistency: number
}

export const useDashboardStore = create<DashboardState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  tasksCompleted: 4,
  studyHours: 2.5,
  xpToday: 340,
  streak: 4,
  consistency: 82,
}))
