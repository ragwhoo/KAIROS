import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { startOfDay, endOfDay } from "date-fns"

export async function GET() {
  const today = new Date()
  const missions = await db.dailyMission.findMany({
    where: {
      date: { gte: startOfDay(today), lte: endOfDay(today) },
    },
    orderBy: { createdAt: "asc" },
  })
  return NextResponse.json(missions)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const mission = await db.dailyMission.create({
      data: { ...body, date: body.date ? new Date(body.date) : new Date() },
    })
    return NextResponse.json(mission, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}
