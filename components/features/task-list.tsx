"use client"

import { AnimatePresence } from "framer-motion"
import { useTasks } from "@/hooks/use-tasks"
import { TaskCard } from "./task-card"
import { TaskListSkeleton } from "./task-list-skeleton"

interface TaskListProps {
  filter?: "all" | "today" | "upcoming" | "completed"
}

export function TaskList({ filter = "all" }: TaskListProps) {
  const { tasks, isLoading, mutate } = useTasks()

  if (isLoading) return <TaskListSkeleton />

  if (tasks.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-10 text-center">
        <p className="text-sm text-text-tertiary">No tasks yet. Add one to get started.</p>
      </div>
    )
  }

  const filtered = tasks.filter((task) => {
    if (filter === "completed") return task.status === "done"
    if (filter === "today") {
      if (!task.dueDate) return false
      return new Date(task.dueDate).toDateString() === new Date().toDateString()
    }
    if (filter === "upcoming") {
      if (!task.dueDate) return false
      return new Date(task.dueDate) > new Date()
    }
    return true
  })

  return (
    <div className="space-y-2.5">
      <AnimatePresence>
        {filtered.map((task) => (
          <TaskCard key={task.id} task={task} onMutate={mutate} />
        ))}
      </AnimatePresence>
      {filtered.length === 0 && tasks.length > 0 && (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center">
          <p className="text-sm text-text-tertiary">No tasks in this view.</p>
        </div>
      )}
    </div>
  )
}
