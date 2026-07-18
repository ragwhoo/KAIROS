import { db } from "@/lib/db"
import { calculateLevel } from "@/lib/xp-utils"

export type { XPSource } from "@/lib/xp-utils"
export { XP_VALUES, XP_LEVELS, calculateLevel, getXPForNextLevel, getXPProgress } from "@/lib/xp-utils"

export async function awardXP(source: string, amount: number, reason: string) {
  let progress = await db.userProgress.findFirst()

  if (!progress) {
    progress = await db.userProgress.create({ data: {} })
  }

  await db.xPEvent.create({
    data: { source, amount, reason },
  })

  const newXP = progress.xp + amount
  const newLevel = calculateLevel(newXP)

  const updateData: Record<string, number | { increment: number }> = {
    xp: newXP,
    level: newLevel,
  }

  if (source === "task") updateData.totalTasks = { increment: 1 }
  else if (source === "note") updateData.totalNotes = { increment: 1 }
  else if (source === "focus") updateData.totalFocusMinutes = { increment: 1 }
  else if (source === "chat") updateData.totalAIChats = { increment: 1 }

  await db.userProgress.update({
    where: { id: progress.id },
    data: updateData,
  })

  try {
    const { updateStreak } = await import("@/lib/streak")
    await updateStreak()
  } catch {}

  return { xp: newXP, level: newLevel, earned: amount }
}
