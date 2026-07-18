"use client"

import { createContext, useContext, useMemo } from "react"
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

  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), [])

  const chat = useChat({
    transport,
    onFinish: () => {
      mutateTasks()
      mutateEvents()
      mutateNotes()
    },
    onError: (err) => {
      console.error("[ChatProvider] useChat error:", err)
    },
  })

  return <ChatContext.Provider value={chat}>{children}</ChatContext.Provider>
}

export function useChatContext(): ChatState {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error("useChatContext must be used within ChatProvider")
  return ctx
}
