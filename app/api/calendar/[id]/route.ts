import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { z } from "zod"

const EventUpdate = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  startTime: z.coerce.date().optional(),
  endTime: z.coerce.date().optional(),
  allDay: z.boolean().optional(),
  subject: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
}).strict()

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json()
    const data = EventUpdate.parse(body)
    const event = await db.calendarEvent.update({ where: { id }, data })
    return NextResponse.json(event)
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request body", issues: e.issues }, { status: 400 })
    }
    if (typeof e === "object" && e !== null && "code" in e && (e as { code: string }).code === "P2025") {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }
    console.error("[PUT /api/calendar]", e)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    await db.calendarEvent.delete({ where: { id } })
  } catch {
    // already deleted — idempotent
  }
  return NextResponse.json({ success: true })
}