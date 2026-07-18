import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { awardXP } from "@/lib/xp"

export async function GET() {
  const events = await db.xPEvent.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  })
  return NextResponse.json(events)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.source || !body.amount || !body.reason) {
      return NextResponse.json(
        { error: "source, amount, and reason are required" },
        { status: 400 }
      )
    }

    const result = await awardXP(body.source, body.amount, body.reason)
    return NextResponse.json(result, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}
