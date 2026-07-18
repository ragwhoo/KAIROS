"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { Sparkles, X } from "lucide-react"
import { useChatContext } from "./chat-provider"
import { cn } from "@/lib/utils"

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

export function ChatToast() {
  const pathname = usePathname()
  const { messages, status } = useChatContext()
  const [toast, setToast] = useState<string | null>(null)
  const lastTextRef = useRef<string | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const isChatPage = pathname === "/ai"
  const isLoading = status === "submitted" || status === "streaming"

  useEffect(() => {
    if (isChatPage) {
      setToast(null)
      return
    }

    // Find the latest assistant message
    const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant")
    if (!lastAssistant) return

    const text = getMessageText(lastAssistant.parts)
    if (!text) return

    // Update toast when text changes (handles streaming)
    if (text !== lastTextRef.current) {
      lastTextRef.current = text
      setToast(text)

      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setToast(null), 8000)
    }
  }, [messages, isChatPage])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  if (!toast) return null

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 w-full max-w-[560px] px-4">
      <div
        className={cn(
          "flex items-start gap-3 rounded-2xl border border-primary-100 bg-surface-1/95 backdrop-blur-xl px-4 py-3 shadow-2xl",
          isLoading && "animate-pulse"
        )}
        style={{
          background: "linear-gradient(135deg, rgba(125,57,235,0.12), rgba(198,255,51,0.04))",
        }}
      >
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-[#7D39EB] to-[#C6FF33] mt-0.5">
          <Sparkles className="h-3 w-3 text-black" />
        </div>
        <div className="flex-1 min-w-0 text-xs leading-relaxed text-[rgba(255,255,255,0.9)] whitespace-pre-wrap">
          {renderLinks(toast)}
        </div>
        <button
          onClick={() => setToast(null)}
          className="shrink-0 text-text-tertiary hover:text-foreground transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
