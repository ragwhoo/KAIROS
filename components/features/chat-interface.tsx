"use client"

import { Send, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useDashboardStore } from "@/store/use-dashboard-store"

export function ChatInterface() {
  const sidebarOpen = useDashboardStore((s) => s.sidebarOpen)

  return (
    <motion.div
      animate={{ left: sidebarOpen ? 240 : 64 }}
      transition={{ type: "spring", stiffness: 300, damping: 30, mass: 1 }}
      className="fixed bottom-0 right-0 z-40 border-t border-border bg-background/80 backdrop-blur-xl left-0"
    >
      <div className="mx-auto max-w-4xl px-4 py-4">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface-1 px-5 py-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#7D39EB] to-[#C6FF33]">
            <Sparkles className="h-4 w-4 text-black" />
          </div>
          <Input
            placeholder="Ask Kairos AI anything..."
            className="border-0 bg-transparent px-0 text-sm placeholder:text-text-tertiary focus-visible:ring-0"
          />
          <Button
            variant="primary"
            size="icon"
            className="shrink-0 h-8 w-8"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
