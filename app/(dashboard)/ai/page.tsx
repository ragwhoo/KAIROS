"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import gsap from "gsap"
import { Sparkles, User, Bookmark, Check } from "lucide-react"
import { PageTransition } from "@/components/features/page-transition"
import { useChatContext } from "@/components/features/chat-provider"
import { useDashboardStore } from "@/store/use-dashboard-store"
import { createNote } from "@/hooks/use-notes"
import { cn } from "@/lib/utils"
import { getMessageText, renderLinks } from "@/lib/chat-utils"

const suggestions = [
  "Plan DBMS revision for my exam next week",
  "What tasks do I have due today?",
  "Create a study schedule for this week",
  "Help me prioritize my tasks",
]

export default function AIPage() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const { messages, sendMessage, status } = useChatContext()
  const pendingChatMessage = useDashboardStore((s) => s.pendingChatMessage)
  const setPendingChatMessage = useDashboardStore((s) => s.setPendingChatMessage)
  const sentRef = useRef(false)
  const isLoading = status === "submitted" || status === "streaming"
  const [saved, setSaved] = useState<Array<{ id: string; role: string; content: string }>>([])
  const loadedRef = useRef(false)

  useEffect(() => {
    if (loadedRef.current) return
    loadedRef.current = true
    fetch("/api/chat")
      .then((r) => r.json())
      .then(setSaved)
      .catch(() => {})
  }, [])

  const scrollToBottom = useCallback(() => {
    if (!scrollRef.current) return
    const el = scrollRef.current
    const target = el.scrollHeight
    gsap.to(el, {
      scrollTop: target,
      duration: 0.6,
      ease: "power2.out",
      overwrite: "auto",
    })
  }, [])

  useEffect(() => {
    if (saved.length > 0) {
      requestAnimationFrame(() => scrollToBottom())
    }
  }, [saved, scrollToBottom])

  useEffect(() => {
    if (messages.length > 0) scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    if (pendingChatMessage && !sentRef.current) {
      sentRef.current = true
      sendMessage({ text: pendingChatMessage })
      setPendingChatMessage(null)
    }
    if (!pendingChatMessage) {
      sentRef.current = false
    }
  }, [pendingChatMessage, sendMessage, setPendingChatMessage])

  return (
    <PageTransition>
      <div className="h-screen flex flex-col">
        <header className="px-4 sm:px-8 lg:px-12 pt-16 sm:pt-20 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#7D39EB] to-[#C6FF33]">
              <Sparkles className="h-5 w-5 text-black" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Kairos AI</h1>
              <p className="text-xs text-text-tertiary">Your study companion</p>
            </div>
          </div>
        </header>

        <div
          ref={scrollRef}
          data-lenis-prevent
          className="flex-1 min-h-0 overflow-y-auto"
        >
          {saved.length === 0 && messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 px-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7D39EB] to-[#C6FF33]">
                <Sparkles className="h-8 w-8 text-black" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">How can I help you today?</h2>
                <p className="text-sm text-text-tertiary max-w-md">
                  I can create tasks, schedule events, plan your study revision, and help you stay on top of your academics.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full max-w-2xl">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage({ text: s })}
                    className="rounded-xl border border-border bg-surface-1 px-4 py-3 text-sm text-left text-text-secondary hover:text-foreground hover:border-primary-100 hover:bg-surface-2 transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="px-4 lg:px-6 py-6 space-y-5 pb-32 w-full max-w-5xl mx-auto">
              {saved.map((msg) => (
                <div key={msg.id}>
                  <div className={cn("flex gap-3 w-full", msg.role === "user" && "flex-row-reverse")}>
                    {msg.role === "assistant" ? (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#7D39EB] to-[#C6FF33]">
                        <Sparkles className="h-4 w-4 text-black" />
                      </div>
                    ) : (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-2">
                        <User className="h-4 w-4 text-text-secondary" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-3 max-w-[80%] text-sm leading-relaxed whitespace-pre-wrap",
                        msg.role === "user"
                          ? "bg-primary text-white"
                          : "bg-surface-1 border border-border text-[rgba(255,255,255,0.9)]"
                      )}
                    >
                      {renderLinks(msg.content)}
                    </div>
                  </div>
                  {msg.role === "assistant" && (
                    <SaveNoteButton messageId={msg.id} text={msg.content} />
                  )}
                </div>
              ))}
              {messages.map((msg) => (
                <div key={msg.id}>
                  <div
                    className={cn(
                      "flex gap-3",
                      msg.role === "user" && "flex-row-reverse"
                    )}
                  >
                    {msg.role === "assistant" ? (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#7D39EB] to-[#C6FF33]">
                        <Sparkles className="h-4 w-4 text-black" />
                      </div>
                    ) : (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-2">
                        <User className="h-4 w-4 text-text-secondary" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-3 max-w-[80%] text-sm leading-relaxed whitespace-pre-wrap",
                        msg.role === "user"
                          ? "bg-primary text-white"
                          : "bg-surface-1 border border-border text-[rgba(255,255,255,0.9)]"
                      )}
                    >
                      {(() => {
                        const text = getMessageText(msg.parts)
                        if (!text && isLoading && msg.role === "assistant") return "..."
                        if (!text) return ""
                        return renderLinks(text)
                      })()}
                    </div>
                  </div>
                  {msg.role === "assistant" && !isLoading && (
                    <SaveNoteButton messageId={msg.id} text={getMessageText(msg.parts)} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  )
}

function SaveNoteButton({ messageId, text }: { messageId: string; text: string }) {
  const [saved, setSaved] = useState(false)

  const handleSave = useCallback(async () => {
    if (!text.trim() || saved) return
    try {
      const title = text.split("\n")[0]?.slice(0, 60) || "Chat note"
      await createNote({ title, content: text })
      setSaved(true)
    } catch {
      // silently fail
    }
  }, [text, saved])

  if (!text.trim()) return null

  return (
    <button
      onClick={handleSave}
      className="ml-11 mt-1.5 flex items-center gap-1.5 text-[11px] text-text-tertiary hover:text-primary transition-colors"
    >
      {saved ? (
        <>
          <Check className="h-3 w-3 text-gamified" />
          <span className="text-gamified">Saved to Notes</span>
        </>
      ) : (
        <>
          <Bookmark className="h-3 w-3" />
          <span>Take Notes</span>
        </>
      )}
    </button>
  )
}
