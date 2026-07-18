import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  let progress = await db.userProgress.findFirst()

  if (!progress) {
    progress = await db.userProgress.create({ data: {} })
  }

  return NextResponse.json(progress)
}
