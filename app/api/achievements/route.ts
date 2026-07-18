import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  const achievements = await db.achievement.findMany({
    orderBy: { createdAt: "asc" },
  })
  return NextResponse.json(achievements)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const achievement = await db.achievement.create({ data: body })
    return NextResponse.json(achievement, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}
