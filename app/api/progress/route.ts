import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    let progress = await db.userProgress.findFirst({ orderBy: { createdAt: "asc" } })
    if (!progress) {
      progress = await db.userProgress.create({ data: {} })
    }
    return NextResponse.json(progress)
  } catch (e) {
    console.error("[GET /api/progress]", e)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}