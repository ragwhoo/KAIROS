"use client"

import { useState } from "react"
import { Send, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useChatContext } from "./chat-provider"
import { cn } from "@/lib/utils"

export function FloatingChatInput() {
  const { sendMessage, status } = useChatContext()
  const [input, setInput] = useState("")
  const isLoading = status === "submitted" || status === "streaming"

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    sendMessage({ text: input })
    setInput("")
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-[560px] px-4">
      <form
        onSubmit={handleSubmit}
        className={cn(
          "flex items-center gap-2 rounded-2xl border border-border bg-surface-1/95 backdrop-blur-xl px-4 py-2.5 shadow-2xl transition-colors",
          isLoading && "border-primary-100"
        )}
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#7D39EB] to-[#C6FF33]">
          <Sparkles className="h-4 w-4 text-black" />
        </div>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isLoading ? "Kairos is thinking..." : "Ask Kairos anything..."}
          className="flex-1 bg-transparent text-sm placeholder:text-text-tertiary focus:outline-none"
        />
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
  )
}
