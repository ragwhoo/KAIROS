import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { z } from "zod"
import { startOfDay, endOfDay } from "date-fns"

const MissionCreate = z.object({
  title: z.string().min(1),
  xpReward: z.number().int().nonnegative(),
  completed: z.boolean().optional(),
  date: z.coerce.date().optional(),
}).strict()

export async function GET() {
  try {
    const today = new Date()
    const missions = await db.dailyMission.findMany({
      where: {
        date: { gte: startOfDay(today), lte: endOfDay(today) },
      },
      orderBy: { createdAt: "asc" },
    })
    return NextResponse.json(missions)
  } catch (e) {
    console.error("[GET /api/missions]", e)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = MissionCreate.parse(body)
    const mission = await db.dailyMission.create({
      data: { ...data, date: data.date ?? new Date() },
    })
    return NextResponse.json(mission, { status: 201 })
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request body", issues: e.issues }, { status: 400 })
    }
    console.error("[POST /api/missions]", e)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}