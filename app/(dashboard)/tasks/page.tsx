"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { PageTransition } from "@/components/features/page-transition"
import { TaskList } from "@/components/features/task-list"
import { AddTaskButton } from "@/components/features/add-task-button"
import { useTasks } from "@/hooks/use-tasks"
import { cn } from "@/lib/utils"
import { ListTodo } from "lucide-react"

const filters = [
  { value: "all" as const, label: "All" },
  { value: "today" as const, label: "Today" },
  { value: "upcoming" as const, label: "Upcoming" },
  { value: "completed" as const, label: "Completed" },
]

export default function TasksPage() {
  const [activeFilter, setActiveFilter] = useState("all")
  const { mutate } = useTasks()

  return (
    <PageTransition>
      <div className="px-4 sm:px-6 lg:px-10 pt-16 sm:pt-20 pb-20 sm:pb-28">
        <div className="flex items-center gap-3 mb-10">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#7D39EB] to-[#C6FF33]">
            <ListTodo className="h-5 w-5 text-black" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
            <p className="text-sm text-text-tertiary">Manage all your tasks and assignments</p>
          </div>
        </div>

        <div className="flex gap-1 mb-8 rounded-xl bg-surface-1 p-1 w-fit">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              className={cn(
                "rounded-lg px-4 py-1.5 text-xs font-medium transition-all",
                activeFilter === f.value
                  ? "bg-primary text-white"
                  : "text-text-tertiary hover:text-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <AddTaskButton onMutate={mutate} />
          <TaskList filter={activeFilter as "all" | "today" | "upcoming" | "completed"} />
        </div>
      </div>
    </PageTransition>
  )
}
