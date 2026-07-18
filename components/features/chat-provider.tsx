"use client"

import { createContext, useContext, useMemo, useEffect, useRef } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { useTasks } from "@/hooks/use-tasks"
import { useCalendarEvents } from "@/hooks/use-calendar-events"
import { useNotes } from "@/hooks/use-notes"

type ChatState = ReturnType<typeof useChat>

const ChatContext = createContext<ChatState | null>(null)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { mutate: mutateTasks } = useTasks()
  const { mutate: mutateEvents } = useCalendarEvents()
  const { mutate: mutateNotes } = useNotes()
  const loadedRef = useRef(false)

  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), [])

  const chat = useChat({
    transport,
    onFinish: async () => {
      mutateTasks()
      mutateEvents()
      mutateNotes()

      for (const msg of chat.messages) {
        if ((msg as any)._saved) continue;
        (msg as any)._saved = true
        const text = msg.parts
          ?.filter((p: any) => p.type === "text")
          .map((p: any) => p.text)
          .join("") ?? ""
        if (!text) continue
        try {
          await fetch("/api/chat", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role: msg.role, content: text }),
          })
        } catch {}
      }
    },
    onError: (err) => {
      console.error("[ChatProvider] useChat error:", err)
    },
  })

  useEffect(() => {
    if (loadedRef.current) return
    loadedRef.current = true
    fetch("/api/chat")
      .then((r) => r.json())
      .then((data: Array<{ id: string; role: string; content: string }>) => {
        const msgs = data.map((m) => ({
          id: m.id,
          role: m.role as "user" | "assistant",
          content: m.content,
          parts: [{ type: "text" as const, text: m.content }],
          _saved: true,
        }))
        chat.setMessages(msgs as any)
      })
      .catch(() => {})
  }, [chat])

  return <ChatContext.Provider value={chat}>{children}</ChatContext.Provider>
}

export function useChatContext(): ChatState {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error("useChatContext must be used within ChatProvider")
  return ctx
}
