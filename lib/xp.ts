import { db } from "@/lib/db"
import { calculateLevel } from "@/lib/xp-utils"
import { updateStreak } from "@/lib/streak"

export type { XPSource } from "@/lib/xp-utils"
export { XP_VALUES, XP_LEVELS, calculateLevel, getXPForNextLevel, getXPProgress } from "@/lib/xp-utils"

export async function awardXP(
  source: string,
  amount: number,
  reason: string,
  opts?: { counterInc?: number }
) {
  try {
    let progress = await db.userProgress.findFirst()

    if (!progress) {
      progress = await db.userProgress.create({ data: {} })
    }

    await db.xPEvent.create({
      data: { source, amount, reason },
    })

    const newXP = progress.xp + amount
    const newLevel = calculateLevel(newXP)

    const inc = opts?.counterInc ?? 1

    const updateData: Record<string, number | { increment: number }> = {
      xp: newXP,
      level: newLevel,
    }

    if (source === "task") updateData.totalTasks = { increment: inc }
    else if (source === "note") updateData.totalNotes = { increment: inc }
    else if (source === "focus") updateData.totalFocusMinutes = { increment: inc }
    else if (source === "chat") updateData.totalAIChats = { increment: inc }

    await db.userProgress.update({
      where: { id: progress.id },
      data: updateData,
    })

    try {
      await updateStreak()
    } catch (e) {
      console.error("[awardXP] streak update failed:", e)
    }

    return { xp: newXP, level: newLevel, earned: amount }
  } catch (e) {
    console.error("[awardXP] failed:", e)
    throw e
  }
}