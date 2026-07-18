"use client"

import { useRef, useEffect } from "react"
import gsap from "gsap"
import { Sparkles, User } from "lucide-react"
import { PageTransition } from "@/components/features/page-transition"
import { useChatContext } from "@/components/features/chat-provider"
import { cn } from "@/lib/utils"

const suggestions = [
  "Plan DBMS revision for my exam next week",
  "What tasks do I have due today?",
  "Create a study schedule for this week",
  "Help me prioritize my tasks",
]

function getMessageText(parts: unknown[]): string {
  if (!Array.isArray(parts)) return ""
  return parts
    .filter((p): p is { type: string; text: string } =>
      typeof p === "object" && p !== null && "type" in p && (p as { type: string }).type === "text"
    )
    .map((p) => p.text)
    .join("")
}

function renderLinks(text: string): React.ReactNode[] {
  const linkRegex = /\[([^\]]+)\]\((\/[^)]+)\)/g
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    parts.push(
      <a
        key={match.index}
        href={match[2]}
        className="text-primary underline underline-offset-2 hover:text-primary-100 transition-colors"
      >
        {match[1]}
      </a>
    )
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts.length > 0 ? parts : [text]
}

export default function AIPage() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const { messages, sendMessage, status } = useChatContext()
  const isLoading = status === "submitted" || status === "streaming"

  useEffect(() => {
    if (scrollRef.current) {
      gsap.to(scrollRef.current, { scrollTop: scrollRef.current.scrollHeight, duration: 0.3 })
    }
  }, [messages])

  return (
    <PageTransition>
      <div className="px-10 pt-20 pb-28 h-screen flex flex-col">
        <div className="flex-1 flex flex-col min-h-0 max-w-4xl mx-auto w-full">
          <div
            ref={scrollRef}
            data-lenis-prevent
            className="flex-1 overflow-y-auto space-y-4 pb-4"
          >
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
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
              messages.map((msg) => (
                <div
                  key={msg.id}
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
                      "rounded-2xl px-4 py-3 max-w-[75%] text-sm leading-relaxed whitespace-pre-wrap",
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
              ))
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
