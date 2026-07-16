import { GreetingHeader } from "@/components/features/greeting-header"
import { XPBar } from "@/components/features/xp-bar"
import { AIWidget } from "@/components/features/ai-widget"
import { CTARow } from "@/components/features/cta-row"
import { GlassPanel } from "@/components/features/glass-panel"
import { TaskList } from "@/components/features/task-list"
import { AddTaskButton } from "@/components/features/add-task-button"
import { StatCard } from "@/components/features/stat-card"
import { PageTransition } from "@/components/features/page-transition"

export default function DashboardPage() {
  return (
    <PageTransition>
      <div className="mx-auto max-w-[680px] px-8 py-8">
        <GreetingHeader />
        <XPBar />
        <AIWidget />

        {/* Stats */}
        <div className="flex gap-2 mb-6">
          <StatCard label="Completed" value={4} />
          <StatCard label="Study Hours" value="2.5" />
          <StatCard label="XP Today" value="+340" accent="lime" />
        </div>

        <CTARow />

        {/* Weekly Insights */}
        <GlassPanel
          title="This Week"
          subtitle="You're on a 4-day streak. Keep going!"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-black/30 border border-[rgba(255,255,255,0.04)] p-3.5">
              <p className="text-xs uppercase tracking-[0.05em] text-text-tertiary">
                Tasks Done
              </p>
              <p className="text-xl font-bold mt-1">18</p>
            </div>
            <div className="rounded-xl bg-black/30 border border-[rgba(255,255,255,0.04)] p-3.5">
              <p className="text-xs uppercase tracking-[0.05em] text-text-tertiary">
                Study Hours
              </p>
              <p className="text-xl font-bold mt-1">12.5</p>
            </div>
            <div className="rounded-xl bg-black/30 border border-[rgba(255,255,255,0.04)] p-3.5">
              <p className="text-xs uppercase tracking-[0.05em] text-text-tertiary">
                Streak
              </p>
              <p className="text-xl font-bold text-gamified mt-1">4 days</p>
            </div>
            <div className="rounded-xl bg-black/30 border border-[rgba(255,255,255,0.04)] p-3.5">
              <p className="text-xs uppercase tracking-[0.05em] text-text-tertiary">
                Consistency
              </p>
              <p className="text-xl font-bold text-primary mt-1">82%</p>
            </div>
          </div>
        </GlassPanel>

        <TaskList />
        <div className="mt-3">
          <AddTaskButton />
        </div>
      </div>
    </PageTransition>
  )
}
