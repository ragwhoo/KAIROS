"use client"

import { useMemo, useState, useRef } from "react"
import { subDays, format, startOfDay, eachDayOfInterval, getDay, startOfWeek, addDays, isToday, isSameDay } from "date-fns"
import useSWR from "swr"
import { fetcher } from "@/lib/fetcher"
import type { XPEvent } from "@/types"

function getColor(xp: number): string {
  if (xp === 0) return "var(--color-surface-2, #1a1a1a)"
  if (xp < 20) return "rgba(125,57,235,0.3)"
  if (xp < 50) return "rgba(125,57,235,0.5)"
  if (xp < 100) return "rgba(125,57,235,0.8)"
  return "rgba(198,255,51,0.7)"
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const DAYS = ["Mon", "Wed", "Fri"]

export function Heatmap({ rangeDays = 365 }: { rangeDays?: number }) {
  const { data: xpEvents } = useSWR<XPEvent[]>("/api/xp", fetcher)
  const [tooltip, setTooltip] = useState<{ date: string; xp: number; x: number; y: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const { weeks, monthLabels } = useMemo(() => {
    const today = startOfDay(new Date())
    const start = subDays(today, rangeDays - 1)
    // Align start to the beginning of its week (Sunday)
    const gridStart = startOfWeek(start, { weekStartsOn: 0 })
    const end = today
    const allDays = eachDayOfInterval({ start: gridStart, end })

    const w: Date[][] = []
    let week: Date[] = []
    for (let i = 0; i < allDays.length; i++) {
      week.push(allDays[i])
      if (week.length === 7) {
        w.push(week)
        week = []
      }
    }
    if (week.length > 0) w.push(week)

    // Month labels: for each week column, mark if its first day is in a new month (vs previous week)
    const labels: { weekIndex: number; label: string }[] = []
    let lastMonth = -1
    w.forEach((wk, idx) => {
      const firstDay = wk[0]
      const month = firstDay.getMonth()
      if (month !== lastMonth && firstDay.getDate() <= 7) {
        labels.push({ weekIndex: idx, label: MONTHS[month] })
        lastMonth = month
      }
    })

    return { weeks: w, monthLabels: labels }
  }, [rangeDays])

  const xpByDay = useMemo(() => {
    const map = new Map<string, number>()
    if (!xpEvents) return map
    for (const event of xpEvents) {
      const day = format(new Date(event.createdAt), "yyyy-MM-dd")
      map.set(day, (map.get(day) ?? 0) + event.amount)
    }
    return map
  }, [xpEvents])

  if (!xpEvents) {
    return <div className="rounded-2xl bg-surface-1 border border-border p-5 animate-pulse h-40" />
  }

  const todayDate = startOfDay(new Date())

  return (
    <div className="rounded-2xl bg-surface-1 border border-border p-5 relative" ref={containerRef}>
      <h3 className="text-sm font-semibold mb-4">Activity ({rangeDays} days)</h3>
      <div className="overflow-x-auto pb-2 custom-h-scroll">
        <div className="inline-flex flex-col gap-1" style={{ minWidth: weeks.length * 14 }}>
          {/* Month labels row */}
          <div className="flex gap-[3px] mb-1 h-3 relative">
            {weeks.map((_, wi) => {
              const label = monthLabels.find((m) => m.weekIndex === wi)
              return (
                <div
                  key={wi}
                  className="w-3 text-[10px] text-text-tertiary absolute"
                  style={{ left: wi * 15, minWidth: 30 }}
                >
                  {label?.label ?? ""}
                </div>
              )
            })}
          </div>
          {/* Body: day labels + grid */}
          <div className="flex gap-2">
            {/* Day-of-week labels */}
            <div className="flex flex-col gap-[3px] w-6 shrink-0">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="h-3 text-[10px] text-text-tertiary leading-3">
                  {i % 2 === 1 && DAYS[Math.floor(i / 2)] ? DAYS[Math.floor(i / 2)] : ""}
                </div>
              ))}
            </div>
            {/* Weeks grid */}
            <div className="flex gap-[3px]">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[3px]">
                  {week.map((day) => {
                    const key = format(day, "yyyy-MM-dd")
                    const xp = xpByDay.get(key) ?? 0
                    const isFuture = day > todayDate
                    const isCurrent = isToday(day)
                    return (
                      <div
                        key={key}
                        onMouseEnter={(e) => {
                          const rect = (e.target as HTMLElement).getBoundingClientRect()
                          const containerRect = containerRef.current?.getBoundingClientRect()
                          setTooltip({
                            date: format(day, "MMM d, yyyy"),
                            xp,
                            x: rect.left - (containerRect?.left ?? 0) + 6,
                            y: rect.top - (containerRect?.top ?? 0) - 6,
                          })
                        }}
                        onMouseLeave={() => setTooltip(null)}
                        className={`relative w-3 h-3 rounded-sm cursor-pointer transition-transform hover:scale-150 ${
                          isCurrent ? "ring-1 ring-primary" : ""
                        }`}
                        style={{
                          backgroundColor: isFuture ? "transparent" : getColor(xp),
                          border: isCurrent ? "1px solid var(--color-primary, #7D39EB)" : "none",
                        }}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky tooltip */}
      {tooltip && (
        <div
          className="absolute z-20 pointer-events-none rounded-lg bg-black/90 border border-border px-2.5 py-1.5 text-[11px] text-white shadow-lg whitespace-nowrap"
          style={{ left: tooltip.x, top: tooltip.y, transform: "translate(-50%, -100%)" }}
        >
          <div className="font-medium">{tooltip.date}</div>
          <div className="text-text-tertiary">{tooltip.xp} XP</div>
        </div>
      )}

      <div className="flex items-center gap-1.5 mt-4 text-[11px] text-text-tertiary">
        <span>Less</span>
        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "var(--color-surface-2, #1a1a1a)" }} />
        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "rgba(125,57,235,0.3)" }} />
        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "rgba(125,57,235,0.5)" }} />
        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "rgba(125,57,235,0.8)" }} />
        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "rgba(198,255,51,0.7)" }} />
        <span>More</span>
        <span className="ml-3 flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm ring-1 ring-primary" />
          today
        </span>
      </div>
    </div>
  )
}