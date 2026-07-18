export type Priority = "low" | "medium" | "high"
export type TaskStatus = "todo" | "in_progress" | "done"

export interface Task {
  id: string
  title: string
  description: string | null
  priority: string
  status: string
  dueDate: string | null
  subject: string | null
  estimatedMinutes: number | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface Note {
  id: string
  title: string
  content: string | null
  subject: string | null
  tags: string
  pinned: boolean
  createdAt: string
  updatedAt: string
}

export interface CalendarEvent {
  id: string
  title: string
  description: string | null
  startTime: string
  endTime: string
  allDay: boolean
  subject: string | null
  color: string | null
  createdAt: string
  updatedAt: string
}

export interface UserProgress {
  id: string
  level: number
  xp: number
  currentStreak: number
  longestStreak: number
  totalTasks: number
  totalNotes: number
  totalFocusMinutes: number
  totalAIChats: number
  lastActiveDate: string | null
  createdAt: string
  updatedAt: string
}

export interface XPEvent {
  id: string
  source: string
  amount: number
  reason: string
  createdAt: string
}

export interface Achievement {
  id: string
  key: string
  title: string
  description: string
  icon: string
  unlockedAt: string | null
  createdAt: string
}

export interface DailyMission {
  id: string
  title: string
  xpReward: number
  completed: boolean
  date: string
  createdAt: string
}

export interface FocusSession {
  id: string
  duration: number
  startedAt: string
  completed: boolean
  createdAt: string
}

export interface ChatMessage {
  id: string
  role: string
  content: string
  createdAt: string
}

export interface Reflection {
  id: string
  wentWell: string
  distraction: string | null
  improve: string
  insight: string | null
  date: string
  createdAt: string
}
