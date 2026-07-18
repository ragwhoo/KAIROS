"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Play, Pause, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const PRESETS = [
  { label: "25 min", minutes: 25 },
  { label: "50 min", minutes: 50 },
  { label: "90 min", minutes: 90 },
]

interface FocusSessionProps {
  open: boolean
  onClose: () => void
}

export function FocusSession({ open, onClose }: FocusSessionProps) {
  const [selectedMinutes, setSelectedMinutes] = useState(25)
  const [secondsLeft, setSecondsLeft] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<string | null>(null)

  const selectPreset = (minutes: number) => {
    setSelectedMinutes(minutes)
    setSecondsLeft(minutes * 60)
    setRunning(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const toggleRunning = useCallback(() => {
    if (!running && !startTimeRef.current) {
      startTimeRef.current = new Date().toISOString()
    }
    setRunning((r) => !r)
  }, [running])

  useEffect(() => {
    if (!running) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setRunning(false)
          if (startTimeRef.current) {
            fetch("/api/xp", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ source: "focus", amount: 40, reason: `${selectedMinutes}min focus session completed` }),
            })
            fetch("/api/focus-sessions", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ duration: selectedMinutes, startedAt: startTimeRef.current, completed: true }),
            })
            startTimeRef.current = null
          }
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [running, selectedMinutes])

  useEffect(() => {
    if (!open) {
      setRunning(false)
      setSecondsLeft(selectedMinutes * 60)
      startTimeRef.current = null
    }
  }, [open, selectedMinutes])

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const isComplete = secondsLeft === 0 && startTimeRef.current === null

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="rounded-3xl bg-surface-1 border border-border p-8 w-full max-w-sm mx-4 text-center"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-gamified" />
                <h2 className="text-lg font-bold">Focus</h2>
              </div>
              <button onClick={onClose} className="text-text-tertiary hover:text-foreground transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex justify-center gap-2 mb-6">
              {PRESETS.map((p) => (
                <button
                  key={p.minutes}
                  onClick={() => selectPreset(p.minutes)}
                  className={cn(
                    "rounded-xl px-4 py-2 text-sm font-medium transition-colors",
                    selectedMinutes === p.minutes
                      ? "bg-primary-100 text-primary"
                      : "bg-surface-2 text-text-tertiary hover:text-foreground"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="text-7xl font-bold tracking-tight mb-8 tabular-nums">
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </div>

            <Button
              variant={running ? "secondary" : "gamified"}
              size="lg"
              onClick={toggleRunning}
              disabled={isComplete}
              className="w-full"
            >
              {running ? (
                <><Pause className="h-4 w-4 mr-2" /> Pause</>
              ) : (
                <><Play className="h-4 w-4 mr-2" /> Start</>
              )}
            </Button>

            {isComplete && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-gamified font-semibold"
              >
                Session complete! +40 XP
              </motion.p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
