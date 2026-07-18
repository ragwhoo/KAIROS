import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  const notes = await db.note.findMany({ orderBy: { createdAt: "desc" } })
  return NextResponse.json(notes)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    if (!body.title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }
    const note = await db.note.create({ data: body })
    return NextResponse.json(note, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}
