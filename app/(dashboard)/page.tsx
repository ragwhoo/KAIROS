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
      <div className="px-10 py-8">
        <GreetingHeader />
        <XPBar />
        <AIWidget />

        {/* Stats */}
        <div className="flex gap-4 mb-8">
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
          <div className="grid grid-cols-4 gap-4">
            <div className="rounded-xl bg-black/30 border border-[rgba(255,255,255,0.04)] p-4">
              <p className="text-xs uppercase tracking-[0.05em] text-text-tertiary">
                Tasks Done
              </p>
              <p className="text-2xl font-bold mt-1">18</p>
            </div>
            <div className="rounded-xl bg-black/30 border border-[rgba(255,255,255,0.04)] p-4">
              <p className="text-xs uppercase tracking-[0.05em] text-text-tertiary">
                Study Hours
              </p>
              <p className="text-2xl font-bold mt-1">12.5</p>
            </div>
            <div className="rounded-xl bg-black/30 border border-[rgba(255,255,255,0.04)] p-4">
              <p className="text-xs uppercase tracking-[0.05em] text-text-tertiary">
                Streak
              </p>
              <p className="text-2xl font-bold text-gamified mt-1">4 days</p>
            </div>
            <div className="rounded-xl bg-black/30 border border-[rgba(255,255,255,0.04)] p-4">
              <p className="text-xs uppercase tracking-[0.05em] text-text-tertiary">
                Consistency
              </p>
              <p className="text-2xl font-bold text-primary mt-1">82%</p>
            </div>
          </div>
        </GlassPanel>

        <div className="grid grid-cols-[1fr_320px] gap-8 mt-6">
          <div>
            <TaskList />
            <div className="mt-3">
              <AddTaskButton />
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl bg-surface-1 border border-border p-5">
              <h3 className="text-sm font-semibold mb-3">Recent Activity</h3>
              <div className="space-y-3">
                {[
                  { action: "Completed Math review", time: "2h ago", color: "text-gamified" },
                  { action: "Added DBMS assignment", time: "4h ago", color: "text-primary" },
                  { action: "Started Physics lab", time: "6h ago", color: "text-text-secondary" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-current" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{item.action}</p>
                      <p className="text-xs text-text-tertiary">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl bg-surface-1 border border-border p-5">
              <h3 className="text-sm font-semibold mb-3">Upcoming</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-sm">DBMS Exam</span>
                  <span className="text-xs text-text-tertiary">6 days</span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-sm">Physics Lab</span>
                  <span className="text-xs text-text-tertiary">Tomorrow</span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-sm">Math Quiz</span>
                  <span className="text-xs text-warning">Friday</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
