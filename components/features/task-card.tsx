"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { Paperclip, Clock } from "lucide-react"

interface TaskCardProps {
  title: string
  priority: "focus" | "success" | "warning" | "danger"
  subject?: string
  dueText?: string
  dueUrgent?: boolean
  attachments?: number
  timeEstimate?: string
  progress?: number
  completed?: boolean
  xpReward?: number
}

const priorityBorderColors = {
  focus: "border-l-[#7D39EB]",
  success: "border-l-[#C6FF33]",
  warning: "border-l-[#FF9F0A]",
  danger: "border-l-[#FF3B5C]",
}

const priorityBadgeVariant = {
  focus: "focus" as const,
  success: "success" as const,
  warning: "warning" as const,
  danger: "danger" as const,
}

const priorityLabels = {
  focus: "Focus",
  success: "Done",
  warning: "Caution",
  danger: "Urgent",
}

export function TaskCard({
  title,
  priority,
  subject,
  dueText,
  dueUrgent,
  attachments,
  timeEstimate,
  progress: progressValue,
  completed = false,
  xpReward,
}: TaskCardProps) {
  const [isCompleted, setIsCompleted] = useState(completed)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-2xl bg-surface-1 border border-border border-l-[3px] p-4 transition-all duration-200 hover:border-primary-100 hover:shadow-card-hover hover:-translate-y-px",
        priorityBorderColors[priority],
        isCompleted && "opacity-60"
      )}
    >
      <div className="flex gap-3 items-start">
        <Checkbox
          checked={isCompleted}
          onCheckedChange={() => setIsCompleted(!isCompleted)}
          className="mt-0.5"
        />
        <div className="flex-1 min-w-0">
          <h4
            className={cn(
              "text-sm font-semibold",
              isCompleted && "line-through text-text-tertiary"
            )}
          >
            {title}
          </h4>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            <Badge variant={priorityBadgeVariant[priority]}>
              ● {priorityLabels[priority]}
            </Badge>
            {subject && <Badge variant="subject">{subject}</Badge>}
          </div>
          <div className="flex items-center gap-4 mt-2.5 text-xs text-text-tertiary">
            {attachments !== undefined && (
              <span className="flex items-center gap-1">
                <Paperclip className="h-3 w-3" />
                {attachments} file{attachments !== 1 ? "s" : ""}
              </span>
            )}
            {timeEstimate && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {timeEstimate} est.
              </span>
            )}
            {dueText && (
              <span className={cn(dueUrgent && "text-destructive font-medium")}>
                {dueText}
              </span>
            )}
            {xpReward && (
              <span className="text-gamified font-semibold">
                +{xpReward} XP
              </span>
            )}
          </div>
          {progressValue !== undefined && (
            <Progress value={progressValue} className="mt-3 h-1" />
          )}
        </div>
      </div>
    </motion.div>
  )
}
