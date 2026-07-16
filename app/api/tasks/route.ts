import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  const tasks = await db.task.findMany({ orderBy: { createdAt: "desc" } })
  return NextResponse.json(tasks)
}

export async function POST(request: Request) {
  const body = await request.json()
  const task = await db.task.create({ data: body })
  return NextResponse.json(task, { status: 201 })
}
