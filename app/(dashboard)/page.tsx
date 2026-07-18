"use client"

import { motion } from "framer-motion"
import { PageTransition } from "@/components/features/page-transition"
import { GreetingHeader } from "@/components/features/greeting-header"
import { AIWidget } from "@/components/features/ai-widget"
import { ProfileCard } from "@/components/features/profile-card"
import { DailyMissions } from "@/components/features/daily-missions"
import { Heatmap } from "@/components/features/heatmap"
import { SkillTree } from "@/components/features/skill-tree"
import { TaskList } from "@/components/features/task-list"
import { AddTaskButton } from "@/components/features/add-task-button"
import { useTasks } from "@/hooks/use-tasks"
import { useCalendarEvents } from "@/hooks/use-calendar-events"
import { Calendar, CheckCircle, Clock, Flame } from "lucide-react"
import { isToday, format } from "date-fns"

export default function HomePage() {
  const { tasks, mutate } = useTasks()
  const { events } = useCalendarEvents()

  const todayTasks = tasks.filter(
    (t) => t.dueDate && isToday(new Date(t.dueDate))
  )
  const completedCount = tasks.filter((t) => t.status === "done").length
  const remainingCount = todayTasks.filter((t) => t.status !== "done").length
  const todayEvents = events.filter((e) => isToday(new Date(e.startTime)))

  const stats = [
    { label: "Tasks Remaining", value: String(remainingCount), icon: CheckCircle, color: "text-primary" },
    { label: "Completed Today", value: String(completedCount), icon: CheckCircle, color: "text-gamified" },
    { label: "Events Today", value: String(todayEvents.length), icon: Calendar, color: "text-primary" },
    { label: "Streak", value: "4 days", icon: Flame, color: "text-gamified" },
  ]

  return (
    <PageTransition>
      <div className="px-4 sm:px-6 lg:px-10 pt-16 sm:pt-20 pb-20 sm:pb-28">
        <GreetingHeader />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl bg-surface-1 border border-border p-5"
            >
              <stat.icon className={`h-5 w-5 ${stat.color} mb-3`} />
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-text-tertiary">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            <ProfileCard />
            <DailyMissions />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            <Heatmap />
            <SkillTree />
          </div>

          <AIWidget />

          <div className="mt-10">
            <h2 className="text-xl font-semibold mb-6">Today&apos;s Tasks</h2>
            <div className="space-y-4">
              <AddTaskButton onMutate={mutate} />
              <TaskList filter="today" />
            </div>
          </div>

          {todayEvents.length > 0 && (
            <div className="mt-10">
              <h2 className="text-xl font-semibold mb-6">Today&apos;s Schedule</h2>
              <div className="space-y-3">
                {todayEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-3 rounded-xl bg-surface-1 border border-border p-3"
                  >
                    <div className="flex flex-col items-center justify-center w-12 shrink-0">
                      <span className="text-xs text-text-tertiary">
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
                    {event.allDay && (
                      <span className="text-xs text-text-tertiary">All day</span>
                    )}
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
