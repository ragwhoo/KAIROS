import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  const tasks = await db.task.findMany({ orderBy: { createdAt: "desc" } })
  return NextResponse.json(tasks)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    if (!body.title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }
    if (body.priority && !["low", "medium", "high"].includes(body.priority)) {
      return NextResponse.json({ error: "Priority must be low, medium, or high" }, { status: 400 })
    }
    const task = await db.task.create({ data: body })
    return NextResponse.json(task, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}
