"use client"

import { Plus } from "lucide-react"

export function AddTaskButton() {
  return (
    <button className="flex w-full items-center gap-2.5 rounded-2xl border border-dashed border-border p-4 text-sm font-medium text-text-tertiary transition-all duration-200 hover:border-primary hover:text-primary hover:bg-primary-50">
      <Plus className="h-5 w-5 text-primary" />
      <span>Add a new task...</span>
    </button>
  )
}
