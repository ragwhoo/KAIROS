"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Award, X } from "lucide-react"

interface UnlockEvent {
  id: string
  key: string
  title: string
  description: string
  icon: string
}

export function AchievementUnlock() {
  const [current, setCurrent] = useState<UnlockEvent | null>(null)

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch("/api/achievements/check")
        if (res.ok) {
          const data: UnlockEvent[] = await res.json()
          if (data.length > 0) {
            setCurrent(data[0])
            setTimeout(() => setCurrent(null), 4000)
          }
        }
      } catch {}
    }
    const interval = setInterval(check, 15000)
    check()
    return () => clearInterval(interval)
  }, [])

  return (
    <AnimatePresence>
      {current && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[9999]"
        >
          <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-[#7D39EB] to-[#C6FF33] p-4 pr-12 shadow-lg">
            <Award className="h-6 w-6 text-black shrink-0" />
            <div className="min-w-0">
              <p className="font-bold text-black text-sm">Achievement Unlocked!</p>
              <p className="text-black/80 text-xs">{current.title}</p>
              <p className="text-black/60 text-xs mt-0.5">{current.description}</p>
            </div>
            <button
              onClick={() => setCurrent(null)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-black/60 hover:text-black transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
