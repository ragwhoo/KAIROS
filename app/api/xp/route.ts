import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { awardXP } from "@/lib/xp"
import { rateLimit } from "@/lib/rate-limit"
import { z } from "zod"

const XPCreate = z.object({
  source: z.string(),
  amount: z.number().int().refine((a) => a > 0 && a <= 100, "Invalid amount"),
  reason: z.string().optional(),
}).strict()

export async function GET() {
  try {
    const events = await db.xPEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    })
    return NextResponse.json(events)
  } catch (e) {
    console.error("[GET /api/xp]", e)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  const { allowed, remaining } = rateLimit(ip, 30, 60000)
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Try again in a minute." },
      { status: 429, headers: { "X-RateLimit-Remaining": "0" } }
    )
  }

  try {
    const body = await request.json()
    const data = XPCreate.parse(body)
    const result = await awardXP(data.source, data.amount, data.reason ?? "")
    return NextResponse.json(result, { status: 201, headers: { "X-RateLimit-Remaining": String(remaining) } })
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request body", issues: e.issues }, { status: 400 })
    }
    console.error("[POST /api/xp]", e)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}