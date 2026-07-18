"use client"

import { PageTransition } from "@/components/features/page-transition"
import { useProgress } from "@/hooks/use-progress"
import { useTasks } from "@/hooks/use-tasks"
import { useAchievements } from "@/hooks/use-achievements"
import { Heatmap } from "@/components/features/heatmap"
import { SkillTree } from "@/components/features/skill-tree"
import { getRank } from "@/lib/ranks"
import { getXPProgress } from "@/lib/xp"
import { Progress } from "@/components/ui/progress"
import { Flame, CheckCircle, Award, Zap } from "lucide-react"
import { format } from "date-fns"

export default function OverviewPage() {
  const { progress } = useProgress()
  const { tasks } = useTasks()
  const { achievements } = useAchievements()

  const completedTasks = tasks.filter((t) => t.status === "done")
  const rank = progress ? getRank(progress.level) : null
  const xpInfo = progress ? getXPProgress(progress.xp) : { current: 0, required: 2000, percentage: 0 }
  const unlockedAchievements = achievements.filter((a) => a.unlockedAt)

  return (
    <PageTransition>
      <div className="px-4 sm:px-6 lg:px-10 pt-16 sm:pt-20 pb-20 sm:pb-28">
        <h1 className="text-2xl font-bold mb-8">Overview</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="rounded-2xl bg-surface-1 border border-border p-5">
            <Award className="h-5 w-5 text-gamified mb-3" />
            <p className="text-2xl font-bold">{progress?.level ?? 1}</p>
            <p className="text-xs text-text-tertiary">Current Level</p>
          </div>
          <div className="rounded-2xl bg-surface-1 border border-border p-5">
            <Flame className="h-5 w-5 text-gamified mb-3" />
            <p className="text-2xl font-bold">{progress?.currentStreak ?? 0}</p>
            <p className="text-xs text-text-tertiary">Day Streak</p>
          </div>
          <div className="rounded-2xl bg-surface-1 border border-border p-5">
            <CheckCircle className="h-5 w-5 text-gamified mb-3" />
            <p className="text-2xl font-bold">{completedTasks.length}</p>
            <p className="text-xs text-text-tertiary">Tasks Done</p>
          </div>
          <div className="rounded-2xl bg-surface-1 border border-border p-5">
            <Zap className="h-5 w-5 text-gamified mb-3" />
            <p className="text-2xl font-bold">{progress?.xp?.toLocaleString() ?? 0}</p>
            <p className="text-xs text-text-tertiary">Total XP</p>
          </div>
        </div>

        {progress && rank && (
          <div className="rounded-2xl bg-surface-1 border border-border p-6 mb-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7D39EB] to-[#C6FF33] text-3xl font-bold text-black">
                {progress.level}
              </div>
              <div>
                <p className="text-xl font-bold">{rank.title}</p>
                <p className="text-sm text-text-tertiary">Level {progress.level}</p>
              </div>
            </div>
            <Progress value={xpInfo.percentage} className="h-2 mb-2" />
            <p className="text-xs text-text-tertiary">
              {xpInfo.current.toLocaleString()} / {xpInfo.required.toLocaleString()} XP to Level {progress.level + 1}
            </p>
          </div>
        )}

        <div className="mb-10">
          <Heatmap />
        </div>

        <div className="mb-10">
          <h2 className="text-lg font-semibold mb-4">Achievements</h2>
          {achievements.length === 0 ? (
            <div className="rounded-2xl bg-surface-1 border border-border p-8 text-center">
              <Award className="h-8 w-8 text-text-tertiary mx-auto mb-2" />
              <p className="text-sm text-text-tertiary">No achievements yet. Complete tasks and maintain streaks to unlock them.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {achievements.map((a) => (
                <div
                  key={a.id}
                  className={`rounded-2xl border p-4 ${a.unlockedAt ? "bg-surface-1 border-border" : "bg-surface-2 border-border/50 opacity-40"}`}
                >
                  <Award className={`h-5 w-5 mb-2 ${a.unlockedAt ? "text-gamified" : "text-text-tertiary"}`} />
                  <p className="text-sm font-semibold">{a.title}</p>
                  <p className="text-xs text-text-tertiary mt-1">{a.description}</p>
                  {a.unlockedAt && (
                    <p className="text-xs text-gamified mt-2">Unlocked {format(new Date(a.unlockedAt), "MMM d, yyyy")}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <SkillTree />
      </div>
    </PageTransition>
  )
}
