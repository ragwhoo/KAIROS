"use client"

import { useMemo } from "react"
import { useTasks } from "@/hooks/use-tasks"
import { CATEGORIES, classifySubject } from "@/lib/categories"

const colorMap: Record<string, string> = {
  programming: "#7D39EB",
  fitness: "#C6FF33",
  reading: "#3B82F6",
  writing: "#F59E0B",
  career: "#F43F5E",
  design: "#D946EF",
  communication: "#14B8A6",
}

export function SkillTree() {
  const { tasks } = useTasks()

  const categoryData = useMemo(() => {
    const completedTasks = tasks.filter((t) => t.status === "done")
    const counts = new Map<string, number>()
    for (const task of completedTasks) {
      const cat = task.subject ? classifySubject(task.subject) : "programming"
      counts.set(cat, (counts.get(cat) ?? 0) + 1)
    }
    const maxCount = Math.max(...counts.values(), 1)
    return CATEGORIES.map((cat) => ({
      ...cat,
      count: counts.get(cat.key) ?? 0,
      percentage: Math.min(100, Math.floor(((counts.get(cat.key) ?? 0) / maxCount) * 100)),
    }))
  }, [tasks])

  return (
    <div className="rounded-2xl bg-surface-1 border border-border p-5">
      <h3 className="text-sm font-semibold mb-4">Skill Tree</h3>
      <div className="space-y-3">
        {categoryData.map((cat) => (
          <div key={cat.key}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-text-secondary">{cat.label}</span>
              <span className="text-xs text-text-tertiary">{cat.count} tasks</span>
            </div>
            <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${cat.percentage}%`, backgroundColor: colorMap[cat.key] ?? "#7D39EB" }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
