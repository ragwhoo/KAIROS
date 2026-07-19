import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { z } from "zod"

const TaskCreate = z.object({
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  status: z.enum(["todo", "in_progress", "done"]).default("todo"),
  dueDate: z.coerce.date().nullable().optional(),
  subject: z.string().nullable().optional(),
  estimatedMinutes: z.number().int().positive().nullable().optional(),
}).strict()

export async function GET() {
  try {
    const tasks = await db.task.findMany({ orderBy: { createdAt: "desc" } })
    return NextResponse.json(tasks)
  } catch (e) {
    console.error("[GET /api/tasks]", e)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = TaskCreate.parse(body)
    const task = await db.task.create({ data })
    return NextResponse.json(task, { status: 201 })
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request body", issues: e.issues }, { status: 400 })
    }
    console.error("[POST /api/tasks]", e)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}