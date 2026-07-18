"use client"

import { useMemo, useState } from "react"
import { subDays, format, startOfDay, eachDayOfInterval } from "date-fns"
import useSWR from "swr"
import { fetcher } from "@/lib/fetcher"
import type { XPEvent } from "@/types"

function getColor(xp: number): string {
  if (xp === 0) return "var(--color-surface-2, #1a1a1a)"
  if (xp < 20) return "rgba(125,57,235,0.3)"
  if (xp < 50) return "rgba(125,57,235,0.5)"
  if (xp < 100) return "rgba(125,57,235,0.7)"
  return "rgba(198,255,51,0.6)"
}

export function Heatmap() {
  const { data: xpEvents } = useSWR<XPEvent[]>("/api/xp", fetcher)
  const [tooltip, setTooltip] = useState<{ date: string; xp: number } | null>(null)

  const days = useMemo(() => {
    const today = startOfDay(new Date())
    return eachDayOfInterval({ start: subDays(today, 364), end: today })
  }, [])

  const xpByDay = useMemo(() => {
    const map = new Map<string, number>()
    if (!xpEvents) return map
    for (const event of xpEvents) {
      const day = format(new Date(event.createdAt), "yyyy-MM-dd")
      map.set(day, (map.get(day) ?? 0) + event.amount)
    }
    return map
  }, [xpEvents])

  const weeks: Date[][] = useMemo(() => {
    const result: Date[][] = []
    let week: Date[] = []
    for (const day of days) {
      week.push(day)
      if (week.length === 7) {
        result.push(week)
        week = []
      }
    }
    if (week.length > 0) result.push(week)
    return result
  }, [days])

  if (!xpEvents) {
    return (
      <div className="rounded-2xl bg-surface-1 border border-border p-5 animate-pulse h-32" />
    )
  }

  return (
    <div className="rounded-2xl bg-surface-1 border border-border p-5">
      <h3 className="text-sm font-semibold mb-4">Activity (365 days)</h3>
      <div className="overflow-x-auto pb-2" style={{ scrollbarWidth: "thin" }}>
        <div className="flex gap-[3px]" style={{ minWidth: weeks.length * 14 }}>
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day) => {
                const key = format(day, "yyyy-MM-dd")
                const xp = xpByDay.get(key) ?? 0
                return (
                  <div
                    key={key}
                    onMouseEnter={() => setTooltip({ date: format(day, "MMM d, yyyy"), xp })}
                    onMouseLeave={() => setTooltip(null)}
                    className="w-3 h-3 rounded-sm cursor-pointer transition-transform hover:scale-125"
                    style={{ backgroundColor: getColor(xp) }}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>
      {tooltip && (
        <div className="mt-2 text-xs text-text-tertiary">
          {tooltip.date} — {tooltip.xp} XP
        </div>
      )}
      <div className="flex items-center gap-1 mt-3 text-xs text-text-tertiary">
        <span>Less</span>
        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "var(--color-surface-2, #1a1a1a)" }} />
        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "rgba(125,57,235,0.3)" }} />
        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "rgba(125,57,235,0.5)" }} />
        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "rgba(125,57,235,0.7)" }} />
        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "rgba(198,255,51,0.6)" }} />
        <span>More</span>
      </div>
    </div>
  )
}
