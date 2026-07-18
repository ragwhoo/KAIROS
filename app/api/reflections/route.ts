import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  const reflections = await db.reflection.findMany({
    orderBy: { date: "desc" },
    take: 30,
  })
  return NextResponse.json(reflections)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const reflection = await db.reflection.create({ data: body })
    return NextResponse.json(reflection, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}
