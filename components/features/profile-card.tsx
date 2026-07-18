"use client"

import { useProgress } from "@/hooks/use-progress"
import { getRank } from "@/lib/ranks"
import { getXPProgress } from "@/lib/xp-utils"
import { Progress } from "@/components/ui/progress"
import { Flame, Zap } from "lucide-react"

export function ProfileCard() {
  const { progress, isLoading } = useProgress()

  if (isLoading || !progress) return <div className="rounded-2xl bg-surface-1 border border-border p-5 animate-pulse h-32" />

  const rank = getRank(progress.level)
  const { current, required, percentage } = getXPProgress(progress.xp)

  return (
    <div className="rounded-2xl bg-surface-1 border border-border p-5">
      <div className="flex items-center gap-4 mb-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7D39EB] to-[#C6FF33] text-2xl font-bold text-black">
          {progress.level}
        </div>
        <div className="flex-1">
          <p className="text-lg font-bold">{rank.title}</p>
          <p className="text-sm text-text-tertiary">Level {progress.level}</p>
        </div>
        <Zap className="h-5 w-5 text-gamified" />
      </div>

      <Progress value={percentage} className="h-2 mb-2" />

      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-text-tertiary">{current.toLocaleString()} XP</span>
        <span className="text-xs text-gamified font-medium">{required.toLocaleString()} XP</span>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <Flame className="h-4 w-4 text-gamified" />
        <span className="font-semibold">{progress.currentStreak} day streak</span>
      </div>
    </div>
  )
}
