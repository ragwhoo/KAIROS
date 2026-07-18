import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json()
    const task = await db.task.update({ where: { id }, data: body })
    return NextResponse.json(task)
  } catch {
    return NextResponse.json({ error: "Task not found" }, { status: 404 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    await db.task.delete({ where: { id } })
  } catch {
    // already deleted — idempotent
  }
  return NextResponse.json({ success: true })
}
