import { streamText, tool, convertToModelMessages, isStepCount } from "ai"
import { z } from "zod"
import { model } from "@/lib/ai"
import { db } from "@/lib/db"

export async function POST(request: Request) {
  const { messages } = await request.json()

  const result = streamText({
    model,
    stopWhen: isStepCount(2),
    maxOutputTokens: 2000,
    system: `You are Kairos AI, a student-centric productivity assistant. You help with:
- Planning study schedules and exam revision
- Creating and managing tasks
- Scheduling calendar events
- Taking notes
- Productivity advice and motivation

Context:
- The user's name is Raghu
- Today is ${new Date().toDateString()}

When the user asks to create tasks, schedule events, or plan revision, USE THE TOOLS to actually create them in the database.

IMPORTANT: After creating anything (task, event, or note), always confirm what you created and include a clickable link so the user can view it. Use this format:
- For tasks: "[View in Tasks](/tasks)"
- For events: "[View in Calendar](/calendar)"
- For notes: "[View in Notes](/notes)"

Be concise, friendly, and encouraging. Use a dark/premium aesthetic tone. Keep responses short unless planning a full schedule.`,
    messages: await convertToModelMessages(messages),
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
}
