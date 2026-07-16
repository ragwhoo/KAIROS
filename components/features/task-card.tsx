"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { Paperclip, Clock, Trash2 } from "lucide-react"
import { updateTask, deleteTask } from "@/hooks/use-tasks"
import type { Task } from "@/types"
import { format, isPast, isToday, isTomorrow } from "date-fns"

interface TaskCardProps {
  task: Task
  onMutate?: () => void
}

function getPriorityMeta(priority: string, status: string) {
  if (status === "done")
    return { border: "border-l-[#C6FF33]", badge: "success" as const, label: "Done" }
  switch (priority) {
    case "high":
      return { border: "border-l-[#FF3B5C]", badge: "danger" as const, label: "Urgent" }
    case "medium":
      return { border: "border-l-[#FF9F0A]", badge: "warning" as const, label: "Caution" }
    default:
      return { border: "border-l-[#7D39EB]", badge: "focus" as const, label: "Focus" }
  }
}

function formatDueDate(dueDate: string | null): { text?: string; urgent?: boolean } {
  if (!dueDate) return {}
  const date = new Date(dueDate)
  if (isToday(date)) return { text: "Due today", urgent: isPast(date) }
  if (isTomorrow(date)) return { text: "Due tomorrow" }
  if (isPast(date)) return { text: `Overdue - ${format(date, "d MMM")}`, urgent: true }
  return { text: format(date, "d MMM") }
}

export function TaskCard({ task, onMutate }: TaskCardProps) {
  const [isCompleted, setIsCompleted] = useState(task.status === "done")
  const { border, badge, label } = getPriorityMeta(task.priority, task.status)
  const due = formatDueDate(task.dueDate)

  const handleToggle = async () => {
    const newStatus = isCompleted ? "todo" : "done"
    setIsCompleted(!isCompleted)
    await updateTask(task.id, {
      status: newStatus,
      completedAt: newStatus === "done" ? new Date().toISOString() : null,
    })
    onMutate?.()
  }

  const handleDelete = async () => {
    await deleteTask(task.id)
    onMutate?.()
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={cn(
        "group rounded-2xl bg-surface-1 border border-border border-l-[3px] p-4 transition-all duration-200 hover:border-primary-100 hover:shadow-card-hover hover:-translate-y-px",
        border,
        isCompleted && "opacity-60"
      )}
    >
      <div className="flex gap-3 items-start">
        <Checkbox
          checked={isCompleted}
          onCheckedChange={handleToggle}
          className="mt-0.5"
        />
        <div className="flex-1 min-w-0">
          <h4
            className={cn(
              "text-sm font-semibold",
              isCompleted && "line-through text-text-tertiary"
            )}
          >
            {task.title}
          </h4>
          {task.description && (
            <p className="text-xs text-text-secondary mt-1 line-clamp-2">
              {task.description}
            </p>
          )}
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            <Badge variant={badge}>● {label}</Badge>
            {task.subject && <Badge variant="subject">{task.subject}</Badge>}
          </div>
          <div className="flex items-center gap-4 mt-2.5 text-xs text-text-tertiary">
            {task.estimatedMinutes && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {task.estimatedMinutes}m est.
              </span>
            )}
            {due.text && (
              <span className={cn(due.urgent && "text-destructive font-medium")}>
                {due.text}
              </span>
            )}
            <span className="text-gamified font-semibold">
              +{task.estimatedMinutes ? Math.floor(task.estimatedMinutes * 2) : 10} XP
            </span>
          </div>
        </div>
        <button
          onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-text-tertiary hover:text-destructive hover:bg-destructive/10 transition-all"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  )
}
