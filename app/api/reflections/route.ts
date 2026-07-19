import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { z } from "zod"

const ReflectionCreate = z.object({
  wentWell: z.string().min(1),
  distraction: z.string().nullable().optional(),
  improve: z.string().min(1),
  insight: z.string().nullable().optional(),
  date: z.coerce.date().optional(),
}).strict()

export async function GET() {
  try {
    const reflections = await db.reflection.findMany({
      orderBy: { date: "desc" },
      take: 30,
    })
    return NextResponse.json(reflections)
  } catch (e) {
    console.error("[GET /api/reflections]", e)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = ReflectionCreate.parse(body)
    const reflection = await db.reflection.create({
      data: { ...data, date: data.date ?? new Date() },
    })
    return NextResponse.json(reflection, { status: 201 })
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request body", issues: e.issues }, { status: 400 })
    }
    console.error("[POST /api/reflections]", e)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}