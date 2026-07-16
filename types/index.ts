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
