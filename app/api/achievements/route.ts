import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { z } from "zod"

const AchievementCreate = z.object({
  key: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
  icon: z.string(),
  unlockedAt: z.coerce.date().nullable().optional(),
}).strict()

export async function GET() {
  try {
    const achievements = await db.achievement.findMany({
      orderBy: { createdAt: "asc" },
    })
    return NextResponse.json(achievements)
  } catch (e) {
    console.error("[GET /api/achievements]", e)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = AchievementCreate.parse(body)
    const achievement = await db.achievement.create({ data })
    return NextResponse.json(achievement, { status: 201 })
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request body", issues: e.issues }, { status: 400 })
    }
    console.error("[POST /api/achievements]", e)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}