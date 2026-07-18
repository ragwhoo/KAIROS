"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Send, Sparkles, Mic, MicOff, RefreshCw } from "lucide-react"
import { useChatContext } from "./chat-provider"
import { cn } from "@/lib/utils"

export function FloatingChatInput() {
  const { sendMessage, status } = useChatContext()
  const [input, setInput] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [micStatus, setMicStatus] = useState<"idle" | "connecting" | "listening" | "error">("idle")
  const [supported, setSupported] = useState(false)
  const recognitionRef = useRef<any>(null)
  const retryCountRef = useRef(0)
  const micStatusRef = useRef(micStatus)
  micStatusRef.current = micStatus
  const isLoading = status === "submitted" || status === "streaming"

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) {
      setSupported(false)
      return
    }
    setSupported(true)

    const recognition = new SR()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = "en-US"

    recognition.onstart = () => {
      console.log("[Voice] onstart")
      setMicStatus("listening")
    }

    recognition.onresult = (event: any) => {
      setMicStatus("listening")
      const transcript = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join("")
      if (transcript) setInput(transcript)
    }

    recognition.onerror = (event: any) => {
      console.log("[Voice] onerror:", event.error, event.message)
      if (event.error === "no-speech") return
      if (event.error === "network" && retryCountRef.current < 3) {
        retryCountRef.current++
        console.log("[Voice] network retry", retryCountRef.current)
        setMicStatus("connecting")
        setTimeout(() => {
          try { recognition.start() } catch {}
        }, 500 * retryCountRef.current)
        return
      }
      setMicStatus("error")
      setIsListening(false)
    }

    recognition.onend = () => {
      console.log("[Voice] onend")
      setIsListening(false)
      if (micStatusRef.current === "listening" || micStatusRef.current === "connecting") {
        setMicStatus("idle")
      }
    }

    recognitionRef.current = recognition
  }, [])

  const toggleListening = useCallback(() => {
    const r = recognitionRef.current
    if (!r) return
    if (isListening || micStatus === "connecting") {
      try { r.stop() } catch {}
      setIsListening(false)
      setMicStatus("idle")
    } else {
      retryCountRef.current = 0
      setMicStatus("connecting")
      try {
        r.start()
        setIsListening(true)
      } catch (err) {
        console.log("[Voice] start threw:", err)
        setMicStatus("error")
        setIsListening(false)
      }
    }
  }, [isListening, micStatus])

  useEffect(() => {
    const r = recognitionRef.current
    if (!r) return
    const handler = () => {
      console.log("[Voice] single auto-retry")
      try { r.start() } catch {}
    }
    window.addEventListener("click", handler, { once: true })
    return () => window.removeEventListener("click", handler)
  }, [])

  const send = useCallback(async () => {
    const text = input.trim()
    console.log("[Chat] send called, text:", JSON.stringify(text), "isLoading:", isLoading)
    if (!text || isLoading) return
    try {
      const result = await sendMessage({ text })
      console.log("[Chat] sendMessage result:", result)
      setInput("")
    } catch (err) {
      console.error("[Chat] sendMessage threw:", err)
    }
  }, [input, isLoading, sendMessage])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const btnIcon = micStatus === "connecting" ? (
    <RefreshCw className="h-4 w-4 animate-spin" />
  ) : isListening ? (
    <MicOff className="h-4 w-4" />
  ) : (
    <Mic className="h-4 w-4" />
  )

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-[560px] px-4">
      <div
        className={cn(
          "flex items-center gap-2 rounded-2xl border border-border bg-surface-1/95 backdrop-blur-xl px-4 py-2.5 shadow-2xl transition-colors",
          isLoading && "border-primary-100",
          isListening && "border-gamified"
        )}
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#7D39EB] to-[#C6FF33]">
          <Sparkles className="h-4 w-4 text-black" />
        </div>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            micStatus === "connecting" ? "Connecting..." : isListening ? "Listening..." : isLoading ? "Kairos is thinking..." : "Ask Kairos anything..."
          }
          className="flex-1 bg-transparent text-sm placeholder:text-text-tertiary focus:outline-none"
        />
        {supported && (
          <button
            type="button"
            onClick={toggleListening}
            className={cn(
              "shrink-0 flex h-8 w-8 items-center justify-center rounded-lg transition-all",
              isListening
                ? "text-gamified bg-gamified-100 animate-pulse"
                : "text-text-tertiary hover:text-foreground hover:bg-surface-2"
            )}
            aria-label={isListening ? "Stop recording" : "Start voice input"}
          >
            {btnIcon}
          </button>
        )}
        <button
          type="button"
          onClick={() => send()}
          disabled={isLoading || !input.trim()}
          className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white disabled:opacity-40 transition-opacity"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
      {micStatus === "error" && (
        <p className="mt-1.5 text-center text-xs text-red-400">
          Voice unavailable. Open chrome://settings/?search=speech and enable &quot;Speak&quot;.
        </p>
      )}
    </div>
  )
}
