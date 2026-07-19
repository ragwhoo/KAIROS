import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { z } from "zod"

const NoteCreate = z.object({
  title: z.string().min(1),
  content: z.string().nullable().optional(),
  subject: z.string().nullable().optional(),
  pinned: z.boolean().optional(),
  tags: z
    .union([z.array(z.string()), z.string()])
    .optional()
    .transform((v) => (Array.isArray(v) ? JSON.stringify(v) : v)),
}).strict()

export async function GET() {
  try {
    const notes = await db.note.findMany({ orderBy: { createdAt: "desc" } })
    return NextResponse.json(notes)
  } catch (e) {
    console.error("[GET /api/notes]", e)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = NoteCreate.parse(body)
    const note = await db.note.create({ data })
    return NextResponse.json(note, { status: 201 })
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request body", issues: e.issues }, { status: 400 })
    }
    console.error("[POST /api/notes]", e)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}