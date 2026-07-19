"use client"

import { useState, useRef, useEffect, useMemo, useCallback } from "react"
import { Send, Sparkles, ChevronUp } from "lucide-react"
import gsap from "gsap"
import { motion, AnimatePresence } from "framer-motion"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Button } from "@/components/ui/button"
import { useDashboardStore } from "@/store/use-dashboard-store"
import { useTasks } from "@/hooks/use-tasks"
import { useCalendarEvents } from "@/hooks/use-calendar-events"
import { useNotes } from "@/hooks/use-notes"
import { cn } from "@/lib/utils"

function getMessageText(parts: unknown[]): string {
  return parts
    .filter((p): p is { type: string; text: string } => 
      typeof p === "object" && p !== null && "type" in p && (p as { type: string }).type === "text"
    )
    .map((p) => p.text)
    .join("")
}

export function ChatInterface() {
  const sidebarOpen = useDashboardStore((s) => s.sidebarOpen)
  const pendingChatMessage = useDashboardStore((s) => s.pendingChatMessage)
  const setPendingChatMessage = useDashboardStore((s) => s.setPendingChatMessage)
  const [expanded, setExpanded] = useState(false)
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)
  const { mutate: mutateTasks } = useTasks()
  const { mutate: mutateEvents } = useCalendarEvents()
  const { mutate: mutateNotes } = useNotes()

  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), [])

  const { messages, sendMessage, status } = useChat({
    transport,
    onFinish: () => {
      mutateTasks()
      mutateEvents()
      mutateNotes()
    },
  })

  const isLoading = status === "submitted" || status === "streaming"

  useEffect(() => {
    if (pendingChatMessage) {
      sendMessage({ text: pendingChatMessage })
      setPendingChatMessage(null)
      setExpanded(true)
    }
  }, [pendingChatMessage, sendMessage, setPendingChatMessage])

  const hasMessages = messages.length > 0

  const scrollToBottom = useCallback(() => {
    if (!scrollRef.current) return
    const el = scrollRef.current
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight
    if (distance <= 0) return
    gsap.to(el, {
      scrollTop: el.scrollHeight,
      duration: Math.min(1.2, 0.4 + distance / 800),
      ease: "power2.out",
      overwrite: "auto",
    })
  }, [])

  useEffect(() => {
    if (messages.length > 0) scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    if (isLoading) setExpanded(true)
  }, [isLoading])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    sendMessage({ text: input })
    setInput("")
  }

  return (
    <motion.div
      animate={{ left: sidebarOpen ? 240 : 64 }}
      transition={{ type: "spring", stiffness: 300, damping: 30, mass: 1 }}
      className="fixed bottom-0 right-0 z-40 border-t border-border bg-background/80 backdrop-blur-xl left-0"
    >
      <div className="mx-auto max-w-4xl px-4 py-4">
        <AnimatePresence>
          {expanded && hasMessages && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div
                ref={scrollRef}
                className="max-h-[40vh] overflow-y-auto space-y-3 mb-3 px-1"
              >
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex gap-2.5",
                      msg.role === "user" && "flex-row-reverse"
                    )}
                  >
                    {msg.role === "assistant" && (
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#7D39EB] to-[#C6FF33] mt-0.5">
                        <Sparkles className="h-3 w-3 text-black" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-2.5 max-w-[80%] text-sm leading-relaxed whitespace-pre-wrap",
                        msg.role === "user"
                          ? "bg-primary text-white"
                          : "bg-surface-2 text-[rgba(255,255,255,0.85)]"
                      )}
                    >
                      {getMessageText(msg.parts) || (isLoading && msg.role === "assistant" ? "..." : "")}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface-1 px-5 py-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#7D39EB] to-[#C6FF33]">
            <Sparkles className="h-4 w-4 text-black" />
          </div>
          <form onSubmit={handleSubmit} className="flex flex-1 items-center gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Kairos AI anything..."
              className="flex-1 bg-transparent text-sm placeholder:text-text-tertiary focus:outline-none"
            />
            {hasMessages && (
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-text-tertiary hover:text-foreground hover:bg-surface-2 transition-colors"
              >
                <ChevronUp className={cn("h-3.5 w-3.5 transition-transform", expanded && "rotate-180")} />
              </button>
            )}
            <Button
              type="submit"
              variant="primary"
              size="icon"
              disabled={isLoading || !input.trim()}
              className="shrink-0 h-8 w-8"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </motion.div>
  )
}
