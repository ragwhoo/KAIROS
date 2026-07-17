"use client"

import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useDashboardStore } from "@/store/use-dashboard-store"

export function AIWidget() {
  const setPendingChatMessage = useDashboardStore((s) => s.setPendingChatMessage)

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-primary-100 p-5"
      style={{
        background:
          "linear-gradient(135deg, rgba(125,57,235,0.15), rgba(198,255,51,0.06))",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 80% 50%, rgba(125,57,235,0.15), transparent 70%)",
        }}
      />

      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#7D39EB] to-[#C6FF33]">
            <Sparkles className="h-4 w-4 text-black" />
          </div>
          <span className="text-sm font-semibold text-primary">Kairos AI</span>
          <span className="h-1.5 w-1.5 rounded-full bg-gamified animate-pulse" />
        </div>

        <p className="text-sm text-[rgba(255,255,255,0.75)] leading-relaxed mb-4">
          You have a DBMS exam in 6 days. I&apos;ve prepared a revision plan
          covering all 4 modules. Want me to schedule it?
        </p>

        <div className="flex gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setPendingChatMessage("Show me the DBMS revision plan for my exam in 6 days")}
          >
            Review Plan
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPendingChatMessage("Schedule the DBMS revision plan covering all 4 modules across the next 6 days")}
          >
            Schedule It
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="bg-gamified-100 text-gamified border-[rgba(198,255,51,0.15)] hover:bg-gamified-100"
            onClick={() => setPendingChatMessage(null)}
          >
            Later
          </Button>
        </div>
      </div>
    </div>
  )
}
