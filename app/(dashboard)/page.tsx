"use client"

import { motion } from "framer-motion"
import { GreetingHeader } from "@/components/features/greeting-header"
import { AIWidget } from "@/components/features/ai-widget"
import { TaskList } from "@/components/features/task-list"
import { AddTaskButton } from "@/components/features/add-task-button"
import { PageTransition } from "@/components/features/page-transition"
import { useTasks } from "@/hooks/use-tasks"
import { useCalendarEvents } from "@/hooks/use-calendar-events"
import { isToday } from "date-fns"
import { format } from "date-fns"
import { Calendar } from "lucide-react"

export default function DashboardPage() {
  const { tasks, mutate } = useTasks()
  const { events } = useCalendarEvents()

  const remainingCount = tasks.filter((t) => t.status !== "done").length
  const todayEvents = events.filter((e) => isToday(new Date(e.startTime)))

  return (
    <PageTransition>
      <div className="px-10 pt-20 pb-28">
        <GreetingHeader />

        <div className="space-y-12">
          <AIWidget />

          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                Today&apos;s Tasks
                <span className="ml-3 text-sm text-text-tertiary font-normal">
                  {remainingCount} remaining
                </span>
              </h2>
            </div>
            <div className="space-y-4">
              <AddTaskButton onMutate={mutate} />
              <TaskList />
            </div>
          </div>

          {todayEvents.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Today&apos;s Schedule</h2>
              <div className="space-y-2">
                {todayEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-3 rounded-xl bg-surface-1 border border-border p-3"
                  >
                    <div className="flex flex-col items-center justify-center w-14 shrink-0">
                      <span className="text-[10px] text-text-tertiary">
                        {format(new Date(event.startTime), "a")}
                      </span>
                      <span className="text-sm font-bold">
                        {format(new Date(event.startTime), "h:mm")}
                      </span>
                    </div>
                    <div className="w-px h-10 bg-border" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{event.title}</p>
                      {event.subject && (
                        <p className="text-xs text-text-tertiary">{event.subject}</p>
                      )}
                    </div>
                    <Calendar className="h-4 w-4 text-text-tertiary shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  )
}
