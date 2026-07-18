"use client"

import { useMissions } from "@/hooks/use-missions"
import { CheckCircle2, Circle, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

export function DailyMissions() {
  const { missions } = useMissions()

  if (!missions.length) return null

  const allDone = missions.every((m) => m.completed)

  return (
    <div className="rounded-2xl bg-surface-1 border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-gamified" />
          <h3 className="text-sm font-semibold">Today&apos;s Missions</h3>
        </div>
        {allDone && (
          <span className="text-xs text-gamified font-medium">All complete!</span>
        )}
      </div>

      <div className="space-y-2">
        {missions.map((mission) => (
          <div
            key={mission.id}
            className={cn(
              "flex items-center gap-3 rounded-xl p-3",
              mission.completed && "opacity-50"
            )}
          >
            {mission.completed ? (
              <CheckCircle2 className="h-4 w-4 text-gamified shrink-0" />
            ) : (
              <Circle className="h-4 w-4 text-text-tertiary shrink-0" />
            )}
            <span className={cn("flex-1 text-sm", mission.completed && "line-through text-text-tertiary")}>
              {mission.title}
            </span>
            <span className="text-xs text-gamified font-semibold">+{mission.xpReward}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
