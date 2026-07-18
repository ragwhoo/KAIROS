import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { checkAchievements } from "@/lib/achievements"

export async function GET() {
  const newlyUnlocked = await checkAchievements()
  const achievements = await db.achievement.findMany({
    where: { key: { in: newlyUnlocked.map((a) => a.key) } },
  })
  return NextResponse.json(achievements)
}
