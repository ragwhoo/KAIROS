import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  const events = await db.calendarEvent.findMany({ orderBy: { startTime: "asc" } })
  return NextResponse.json(events)
}

export async function POST(request: Request) {
  const body = await request.json()
  const event = await db.calendarEvent.create({ data: body })
  return NextResponse.json(event, { status: 201 })
}
