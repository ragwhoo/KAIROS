import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  const events = await db.calendarEvent.findMany({ orderBy: { startTime: "asc" } })
  return NextResponse.json(events)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    if (!body.title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }
    const event = await db.calendarEvent.create({ data: body })
    return NextResponse.json(event, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}
