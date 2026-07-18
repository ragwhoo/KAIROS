export type XPSource =
  | "task"
  | "note"
  | "focus"
  | "streak"
  | "achievement"
  | "chat"
  | "mission"

export const XP_VALUES: Record<string, number> = {
  task_completed: 15,
  task_high_priority: 35,
  event_finished: 20,
  note_created: 10,
  focus_session: 40,
  streak_7day: 150,
  ai_chat: 15,
}

export const XP_LEVELS = [
  0, 120, 300, 620, 1100, 1700, 2500, 3500, 4800, 6400, 8500, 11000, 14000, 17500, 22000,
]

export function calculateLevel(xp: number): number {
  for (let i = XP_LEVELS.length - 1; i >= 0; i--) {
    if (xp >= XP_LEVELS[i]) {
      return i + 1
    }
  }
  return 1
}

export function getXPForNextLevel(level: number): number {
  if (level < 1) return XP_LEVELS[0]
  if (level >= XP_LEVELS.length) return Infinity
  return XP_LEVELS[level] - XP_LEVELS[level - 1]
}

export function getXPProgress(xp: number) {
  const level = calculateLevel(xp)
  const currentThreshold = XP_LEVELS[level - 1]
  const nextThreshold = XP_LEVELS[level] ?? Infinity
  const current = xp - currentThreshold
  const required = nextThreshold === Infinity ? current : nextThreshold - currentThreshold
  const percentage = Math.min(100, Math.floor((current / required) * 100))
  return { current, required, percentage, level }
}
