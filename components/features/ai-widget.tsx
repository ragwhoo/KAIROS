"use client"

import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AIWidget() {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-primary-100 p-5 mb-6"
      style={{
        background:
          "linear-gradient(135deg, rgba(125,57,235,0.12), rgba(198,255,51,0.06))",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 80% 50%, rgba(125,57,235,0.1), transparent 70%)",
        }}
      />

      <div className="relative">
        <div className="flex items-center gap-2.5 mb-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#7D39EB] to-[#C6FF33]">
            <Sparkles className="h-4 w-4 text-black" />
          </div>
          <span className="text-sm font-semibold text-primary">Kairos AI</span>
          <span className="h-1.5 w-1.5 rounded-full bg-gamified animate-pulse" />
        </div>

        <p className="text-sm text-[rgba(255,255,255,0.7)] leading-relaxed mb-3.5">
          You have a DBMS exam in 6 days. I&apos;ve prepared a revision plan
          covering all 4 modules. Want me to schedule it?
        </p>

        <div className="flex gap-2">
          <Button variant="primary" size="sm">
            Review Plan
          </Button>
          <Button variant="secondary" size="sm">
            Schedule It
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="bg-gamified-100 text-gamified border-[rgba(198,255,51,0.15)] hover:bg-gamified-100"
          >
            Later
          </Button>
        </div>
      </div>
    </div>
  )
}
