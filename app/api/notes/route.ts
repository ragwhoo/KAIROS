import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  const notes = await db.note.findMany({ orderBy: { createdAt: "desc" } })
  return NextResponse.json(notes)
}

export async function POST(request: Request) {
  const body = await request.json()
  const note = await db.note.create({ data: body })
  return NextResponse.json(note, { status: 201 })
}
