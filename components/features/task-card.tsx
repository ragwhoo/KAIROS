"use client"

import { useRef, useState } from "react"
import { motion } from "framer-motion"
import gsap from "gsap"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Clock, Trash2 } from "lucide-react"
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
  const cardRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const isAnimatingRef = useRef(false)
  const { border, badge, label } = getPriorityMeta(task.priority, task.status)
  const due = formatDueDate(task.dueDate)

  const handleToggle = async () => {
    if (isAnimatingRef.current) return
    const newStatus = isCompleted ? "todo" : "done"

    if (newStatus === "done") {
      isAnimatingRef.current = true
      setIsCompleted(true)

      const tl = gsap.timeline({
        onComplete: () => {
          isAnimatingRef.current = false
          gsap.set(overlayRef.current, { scaleX: 0, opacity: 1 })
        },
      })

      tl.fromTo(overlayRef.current, { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: "power3.out", transformOrigin: "0% 50%" })
        .to(overlayRef.current, { scaleX: 0, opacity: 0, duration: 0.2, ease: "power2.out" })
        .call(async () => {
          await updateTask(task.id, {
            status: newStatus,
            completedAt: new Date().toISOString(),
          })
          onMutate?.()
        })
    } else {
      setIsCompleted(false)
      await updateTask(task.id, {
        status: newStatus,
        completedAt: null,
      })
      onMutate?.()
    }
  }

  const handleDelete = async () => {
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        x: 60, opacity: 0, height: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0,
        duration: 0.25, ease: "power2.in",
        onComplete: async () => {
          await deleteTask(task.id)
          onMutate?.()
        },
      })
    } else {
      await deleteTask(task.id)
      onMutate?.()
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ opacity: 0, x: 100, transition: { duration: 0.25 } }}
    >
      <div
        ref={cardRef}
        className={cn(
          "group relative rounded-2xl bg-surface-1 border border-border border-l-[3px] p-4 transition-colors duration-200 hover:border-primary-100 overflow-hidden",
          border,
          isCompleted && "opacity-60"
        )}
      >
        <div
          ref={overlayRef}
          className="absolute inset-0 z-20 pointer-events-none bg-[#C6FF33]"
          style={{ transform: "scaleX(0)", transformOrigin: "left center" }}
        />

        <div className="flex gap-3 items-start relative z-20">
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
      </div>
    </motion.div>
  )
}
