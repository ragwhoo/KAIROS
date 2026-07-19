import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { z } from "zod"

const TaskUpdate = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  status: z.enum(["todo", "in_progress", "done"]).optional(),
  dueDate: z.coerce.date().nullable().optional(),
  subject: z.string().nullable().optional(),
  estimatedMinutes: z.number().int().positive().nullable().optional(),
}).strict()

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json()
    const data = TaskUpdate.parse(body)
    const task = await db.task.update({ where: { id }, data })
    return NextResponse.json(task)
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request body", issues: e.issues }, { status: 400 })
    }
    if (typeof e === "object" && e !== null && "code" in e && (e as { code: string }).code === "P2025") {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }
    console.error("[PUT /api/tasks]", e)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
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