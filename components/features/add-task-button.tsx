"use client"

import { useState } from "react"
import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createTask } from "@/hooks/use-tasks"
import { cn } from "@/lib/utils"

export function AddTaskButton({ onMutate }: { onMutate?: () => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium")
  const [subject, setSubject] = useState("")
  const [dueDate, setDueDate] = useState("")

  const handleSubmit = async () => {
    if (!title.trim()) return
    await createTask({
      title: title.trim(),
      priority,
      subject: subject.trim() || null,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      status: "todo",
    })
    setTitle("")
    setSubject("")
    setDueDate("")
    setPriority("medium")
    setIsOpen(false)
    onMutate?.()
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center gap-2.5 rounded-2xl border border-dashed border-border p-4 text-sm font-medium text-text-tertiary transition-all duration-200 hover:border-primary hover:text-primary hover:bg-primary-50"
      >
        <Plus className="h-5 w-5 text-primary" />
        <span>Add a new task...</span>
      </button>
    )
  }

  return (
    <div className="rounded-2xl border border-border bg-surface-1 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">New Task</span>
        <button
          onClick={() => setIsOpen(false)}
          className="flex h-6 w-6 items-center justify-center rounded-lg text-text-tertiary hover:text-foreground hover:bg-surface-2 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        placeholder="Task title..."
        autoFocus
        className="border-0 bg-surface-2"
      />
      <div className="flex flex-wrap gap-2">
        {(["low", "medium", "high"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPriority(p)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors",
              priority === p
                ? p === "high"
                  ? "bg-destructive/20 text-destructive"
                  : p === "medium"
                    ? "bg-warning/20 text-warning"
                    : "bg-primary-100 text-primary"
                : "bg-surface-2 text-text-tertiary hover:text-foreground"
            )}
          >
            {p}
          </button>
        ))}
        <Input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject"
          className="h-7 w-24 border-0 bg-surface-2 text-xs"
        />
        <Input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="h-7 w-auto border-0 bg-surface-2 text-xs"
        />
      </div>
      <Button variant="primary" size="sm" onClick={handleSubmit} className="w-full">
        Add Task
      </Button>
    </div>
  )
}
