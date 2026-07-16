import { create } from "zustand"

interface DashboardState {
  tasksCompleted: number
  studyHours: number
  xpToday: number
  streak: number
  consistency: number
}

export const useDashboardStore = create<DashboardState>(() => ({
  tasksCompleted: 4,
  studyHours: 2.5,
  xpToday: 340,
  streak: 4,
  consistency: 82,
}))
