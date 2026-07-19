import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { z } from "zod"

const EventCreate = z.object({
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  allDay: z.boolean().optional(),
  subject: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
}).strict()

export async function GET() {
  try {
    const events = await db.calendarEvent.findMany({ orderBy: { startTime: "asc" } })
    return NextResponse.json(events)
  } catch (e) {
    console.error("[GET /api/calendar]", e)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = EventCreate.parse(body)
    const event = await db.calendarEvent.create({ data })
    return NextResponse.json(event, { status: 201 })
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request body", issues: e.issues }, { status: 400 })
    }
    console.error("[POST /api/calendar]", e)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}