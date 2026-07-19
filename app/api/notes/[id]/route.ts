import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { z } from "zod"

const NoteUpdate = z.object({
  title: z.string().min(1).optional(),
  content: z.string().nullable().optional(),
  subject: z.string().nullable().optional(),
  pinned: z.boolean().optional(),
  tags: z
    .union([z.array(z.string()), z.string()])
    .optional()
    .transform((v) => (Array.isArray(v) ? JSON.stringify(v) : v)),
}).strict()

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json()
    const data = NoteUpdate.parse(body)
    const note = await db.note.update({ where: { id }, data })
    return NextResponse.json(note)
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request body", issues: e.issues }, { status: 400 })
    }
    if (typeof e === "object" && e !== null && "code" in e && (e as { code: string }).code === "P2025") {
      return NextResponse.json({ error: "Note not found" }, { status: 404 })
    }
    console.error("[PUT /api/notes]", e)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    await db.note.delete({ where: { id } })
  } catch {
    // already deleted — idempotent
  }
  return NextResponse.json({ success: true })
}