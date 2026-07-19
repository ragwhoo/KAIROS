import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { z } from "zod"

const FocusSessionCreate = z.object({
  duration: z.number().int().positive(),
  startedAt: z.coerce.date(),
  completed: z.boolean().optional(),
}).strict()

export async function GET() {
  try {
    const sessions = await db.focusSession.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    })
    return NextResponse.json(sessions)
  } catch (e) {
    console.error("[GET /api/focus-sessions]", e)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = FocusSessionCreate.parse(body)
    const session = await db.focusSession.create({ data })
    return NextResponse.json(session, { status: 201 })
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request body", issues: e.issues }, { status: 400 })
    }
    console.error("[POST /api/focus-sessions]", e)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}