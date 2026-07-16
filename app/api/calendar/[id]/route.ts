import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const event = await db.calendarEvent.update({ where: { id }, data: body })
  return NextResponse.json(event)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await db.calendarEvent.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
