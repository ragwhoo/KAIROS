import { db } from "@/lib/db"

export interface AchievementDef {
  key: string
  title: string
  description: string
  icon: string
  check: (progress: {
    xp: number
    level: number
    currentStreak: number
    totalTasks: number
    totalNotes: number
    totalFocusMinutes: number
    totalAIChats: number
  }) => boolean
}

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  { key: "first_task", title: "First Steps", description: "Complete your first task", icon: "check-circle", check: (p) => p.totalTasks >= 1 },
  { key: "ten_tasks", title: "Getting Things Done", description: "Complete 10 tasks", icon: "list", check: (p) => p.totalTasks >= 10 },
  { key: "hundred_tasks", title: "Task Master", description: "Complete 100 tasks", icon: "award", check: (p) => p.totalTasks >= 100 },
  { key: "first_chat", title: "AI Explorer", description: "Have your first AI chat", icon: "message-circle", check: (p) => p.totalAIChats >= 1 },
  { key: "ten_notes", title: "Note Taker", description: "Create 10 notes", icon: "file-text", check: (p) => p.totalNotes >= 10 },
  { key: "week_streak", title: "Weekly Warrior", description: "Maintain a 7-day streak", icon: "flame", check: (p) => p.currentStreak >= 7 },
  { key: "month_streak", title: "Unstoppable", description: "Maintain a 30-day streak", icon: "zap", check: (p) => p.currentStreak >= 30 },
  { key: "focus_master", title: "Focus Master", description: "Complete 10 hours of focus sessions", icon: "clock", check: (p) => p.totalFocusMinutes >= 600 },
  { key: "night_owl", title: "Night Owl", description: "Complete 5 tasks after 10 PM", icon: "moon", check: () => false },
  { key: "early_bird", title: "Early Bird", description: "Complete 5 tasks before 8 AM", icon: "sunrise", check: () => false },
]

export async function checkAchievements() {
  const progress = await db.userProgress.findFirst()
  if (!progress) return []

  const existing = await db.achievement.findMany()
  const unlockedKeys = new Set(existing.filter((a) => a.unlockedAt).map((a) => a.key))

  const newlyUnlocked: AchievementDef[] = []

  for (const def of ACHIEVEMENT_DEFS) {
    if (unlockedKeys.has(def.key)) continue
    if (def.check(progress)) {
      try {
        await db.achievement.upsert({
          where: { key: def.key },
          update: { unlockedAt: new Date() },
          create: {
            key: def.key,
            title: def.title,
            description: def.description,
            icon: def.icon,
            unlockedAt: new Date(),
          },
        })
      } catch (err: unknown) {
        const code =
          typeof err === "object" && err !== null && "code" in err
            ? (err as { code?: string }).code
            : undefined
        if (code === "P2002") {
          // Already locked by a concurrent check — silently ignore
        } else {
          console.warn("[achievements] failed to upsert achievement", {
            key: def.key,
            error: err,
          })
        }
      }
      newlyUnlocked.push(def)
    }
  }

  return newlyUnlocked
}
