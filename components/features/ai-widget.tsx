"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useDashboardStore } from "@/store/use-dashboard-store"
import { useTasks } from "@/hooks/use-tasks"
import { useCalendarEvents } from "@/hooks/use-calendar-events"

export function AIWidget() {
  const router = useRouter()
  const setPendingChatMessage = useDashboardStore((s) => s.setPendingChatMessage)
  const { tasks } = useTasks()
  const { events } = useCalendarEvents()

  const suggestion = useMemo(() => {
    const urgentTask = tasks.find((t) => t.priority === "high" && t.status !== "done")
    const nextEvent = events
      .filter((e) => new Date(e.startTime) > new Date())
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0]
    const undoneTask = tasks.find((t) => t.status !== "done" && t.dueDate)

    if (urgentTask) {
      return {
        text: `You have a high-priority task: "${urgentTask.title}"${urgentTask.dueDate ? ". It's due soon" : ""}. Want me to help plan it out?`,
        action: `Help me plan and break down "${urgentTask.title}"${urgentTask.subject ? ` for ${urgentTask.subject}` : ""}`,
        buttons: ["Plan It", "Remind Me Later"] as const,
        type: "task" as const,
      }
    }
    if (nextEvent) {
      return {
        text: `You have "${nextEvent.title}" coming up${nextEvent.subject ? ` in ${nextEvent.subject}` : ""}. Want to prepare?`,
        action: `Help me prepare for "${nextEvent.title}"${nextEvent.subject ? ` in ${nextEvent.subject}` : ""}`,
        buttons: ["Prepare", "Later"] as const,
        type: "event" as const,
      }
    }
    return null
  }, [tasks, events])

  if (!suggestion) return null

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-primary-100 p-5"
      style={{
        background:
          "linear-gradient(135deg, rgba(125,57,235,0.15), rgba(198,255,51,0.06))",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 80% 50%, rgba(125,57,235,0.15), transparent 70%)",
        }}
      />

      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#7D39EB] to-[#C6FF33]">
            <Sparkles className="h-4 w-4 text-black" />
          </div>
          <span className="text-sm font-semibold text-primary">Kairos AI</span>
          <span className="h-1.5 w-1.5 rounded-full bg-gamified animate-pulse" />
        </div>

        <p className="text-sm text-[rgba(255,255,255,0.75)] leading-relaxed mb-4">
          {suggestion.text}
        </p>

        <div className="flex gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setPendingChatMessage(suggestion.action)
              router.push("/ai")
            }}
          >
            {suggestion.buttons[0]}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="bg-gamified-100 text-gamified border-[rgba(198,255,51,0.15)] hover:bg-gamified-100"
            onClick={() => setPendingChatMessage(null)}
          >
            {suggestion.buttons[1]}
          </Button>
        </div>
      </div>
    </div>
  )
}
