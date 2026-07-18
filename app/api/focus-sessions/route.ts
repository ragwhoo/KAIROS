import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  const sessions = await db.focusSession.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  })
  return NextResponse.json(sessions)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const session = await db.focusSession.create({ data: body })
    return NextResponse.json(session, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}
