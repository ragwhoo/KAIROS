import { streamText, tool, isStepCount, type ModelMessage } from "ai"
import { z } from "zod"
import { model } from "@/lib/ai"
import { db } from "@/lib/db"
import { rateLimit } from "@/lib/rate-limit"
import { NextResponse } from "next/server"
import { awardXP } from "@/lib/xp"

export async function GET() {
  const messages = await db.chatMessage.findMany({ orderBy: { createdAt: "asc" } })
  return NextResponse.json(messages)
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { role, content } = body
    if (!role || !content) {
      return NextResponse.json({ error: "role and content required" }, { status: 400 })
    }
    const message = await db.chatMessage.create({ data: { role, content } })
    return NextResponse.json(message, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to save message" }, { status: 500 })
  }
}

function extractText(part: unknown): string {
  if (typeof part === "string") return part
  if (part && typeof part === "object" && "text" in part) return String((part as { text: string }).text)
  return ""
}

function toCoreMessages(raw: unknown[]): ModelMessage[] {
  return raw.map((m: any) => {
    const role = m?.role ?? "user"
    const parts = m?.parts ?? []
    const text = Array.isArray(parts)
      ? parts.map(extractText).join("")
      : String(m?.content ?? "")
    return { role, content: text } as ModelMessage
  })
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  const { allowed, remaining } = rateLimit(ip, 20, 60000)
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests. Try again in a minute." }, { status: 429, headers: { "X-RateLimit-Remaining": "0" } })
  }

  try { await awardXP("chat", 15, "AI conversation") } catch {}

  const body = await request.json()
  const messages = toCoreMessages(body?.messages ?? [])

  console.log("[API/chat] messages:", JSON.stringify(messages).slice(0, 200))

  let result
  try {
    result = streamText({
      model,
      stopWhen: isStepCount(2),
      maxOutputTokens: 1200,
      system: `You are Kairos AI, a student-centric productivity assistant. Your job is to automatically manage tasks, schedule events, and take notes from natural conversation — the user should almost never need to create anything manually.

Core behavior:
- When the user mentions any study plan, deadline, exam, assignment, or to-do item, **automatically create it as a task** using createTask. Auto-assign priority: high for tasks due today (urgent/expressed same-day), medium for tasks due within next 2 days, low for tasks due within the next week. Set a reasonable due date if mentioned.
- When the user mentions a class, meeting, study session, or time-bound activity, **automatically create it as a calendar event** using createEvent.
- When the user shares something worth noting (key concept, summary, idea), **automatically create a note** using createNote.
- Proactively suggest study schedules, revision plans, and productivity improvements based on the conversation.
- The user should never have to say "create a task" — just mentioning "I have a DBMS exam next week" should create the task automatically.

Context:
- The user's name is Raghu
- Today is ${new Date().toDateString()}

Always confirm what you created and include a clickable link:
- For tasks: "[View in Tasks](/tasks)"
- For events: "[View in Calendar](/calendar)"
- For notes: "[View in Notes](/notes)"

Be concise, friendly, and encouraging. Use a dark/premium aesthetic tone. Never ask permission — just create, confirm in one short line, and stop. If there's nothing to update, respond generically in one sentence.`,
    messages,
    tools: {
      getTasks: tool({
        description: "Get all tasks for the user",
        inputSchema: z.object({}),
        execute: async () => {
          const tasks = await db.task.findMany({ orderBy: { dueDate: "asc" } })
          return tasks.map((t) => ({
            id: t.id,
            title: t.title,
            priority: t.priority,
            status: t.status,
            dueDate: t.dueDate,
            subject: t.subject,
          }))
        },
      }),
      getEvents: tool({
        description: "Get all calendar events for the user",
        inputSchema: z.object({}),
        execute: async () => {
          const events = await db.calendarEvent.findMany({ orderBy: { startTime: "asc" } })
          return events.map((e) => ({
            id: e.id,
            title: e.title,
            startTime: e.startTime,
            endTime: e.endTime,
            subject: e.subject,
          }))
        },
      }),
      createTask: tool({
        description: "Create a new task",
        inputSchema: z.object({
          title: z.string().describe("Task title"),
          priority: z.enum(["low", "medium", "high"]).describe("Task priority"),
          subject: z.string().optional().describe("Subject name"),
          dueDate: z.string().optional().describe("Due date in ISO format"),
          estimatedMinutes: z.number().optional().describe("Estimated minutes to complete"),
        }),
        execute: async ({ title, priority, subject, dueDate, estimatedMinutes }) => {
          const task = await db.task.create({
            data: {
              title,
              priority,
              subject: subject || null,
              dueDate: dueDate ? new Date(dueDate) : null,
              estimatedMinutes: estimatedMinutes || null,
              status: "todo",
            },
          })
          return { success: true, id: task.id, title: task.title }
        },
      }),
      createEvent: tool({
        description: "Create a calendar event",
        inputSchema: z.object({
          title: z.string().describe("Event title"),
          startTime: z.string().describe("Start time in ISO format"),
          endTime: z.string().describe("End time in ISO format"),
          subject: z.string().optional().describe("Subject name"),
          allDay: z.boolean().optional().describe("Whether it's an all-day event"),
        }),
        execute: async ({ title, startTime, endTime, subject, allDay }) => {
          const event = await db.calendarEvent.create({
            data: {
              title,
              startTime: new Date(startTime),
              endTime: new Date(endTime),
              subject: subject || null,
              allDay: allDay || false,
            },
          })
          return { success: true, id: event.id, title: event.title }
        },
      }),
      createNote: tool({
        description: "Create a new note",
        inputSchema: z.object({
          title: z.string().describe("Note title"),
          content: z.string().optional().describe("Note content"),
          subject: z.string().optional().describe("Subject name"),
        }),
        execute: async ({ title, content, subject }) => {
          const note = await db.note.create({
            data: {
              title,
              content: content || null,
              subject: subject || null,
              pinned: false,
              tags: "[]",
            },
          })
          return { success: true, id: note.id, title: note.title }
        },
      }),
    },
  })

  return result.toUIMessageStreamResponse()
  } catch (e) {
    console.error("[API/chat] streamText error:", e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
