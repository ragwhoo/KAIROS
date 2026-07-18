"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Send, Sparkles, Mic, MicOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useChatContext } from "./chat-provider"
import { cn } from "@/lib/utils"

export function FloatingChatInput() {
  const { sendMessage, status } = useChatContext()
  const [input, setInput] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [supported, setSupported] = useState(true)
  const [micFailed, setMicFailed] = useState(false)
  const recognitionRef = useRef<any>(null)
  const isLoading = status === "submitted" || status === "streaming"

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      console.log("[Voice] SpeechRecognition not available")
      setSupported(false)
      return
    }
    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = "en-US"

    recognition.onresult = (event: any) => {
      setMicFailed(false)
      const transcript = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join("")
      console.log("[Voice] onresult:", transcript)
      setInput(transcript)
    }

    recognition.onend = () => {
      console.log("[Voice] onend fired")
      setIsListening(false)
    }

    let networkRetries = 0

    recognition.onerror = (event: any) => {
      console.log("[Voice] onerror:", event.error, event.message)
      if (event.error === "network" && networkRetries < 1) {
        networkRetries++
        console.log("[Voice] network error, retrying once...")
        setTimeout(() => recognition.start(), 300)
        return
      }
      if (event.error === "network") {
        setMicFailed(true)
        setTimeout(() => setMicFailed(false), 8000)
      }
      setIsListening(false)
    }

    recognition.onend = () => {
      console.log("[Voice] onend fired")
      setIsListening(false)
    }

    recognitionRef.current = recognition
  }, [])

  const toggleListening = useCallback(async () => {
    if (!recognitionRef.current) return
    if (isListening) {
      console.log("[Voice] stopping")
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      setMicFailed(false)
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        stream.getTracks().forEach((t) => t.stop())
        console.log("[Voice] mic permission granted")
      } catch {
        console.log("[Voice] mic permission denied")
        setMicFailed(true)
        setTimeout(() => setMicFailed(false), 5000)
        return
      }
      console.log("[Voice] starting")
      recognitionRef.current.start()
      setIsListening(true)
    }
  }, [isListening])

  const send = useCallback(() => {
    const text = input.trim()
    console.log("[Chat] send() called, text:", text, "isLoading:", isLoading)
    if (!text || isLoading) return
    console.log("[Chat] calling sendMessage")
    sendMessage({ text })
    setInput("")
  }, [input, isLoading, sendMessage])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      console.log("[Chat] Enter keyDown")
      send()
    }
  }

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
            isListening ? "Listening..." : isLoading ? "Kairos is thinking..." : "Ask Kairos anything..."
          }
          className="flex-1 bg-transparent text-sm placeholder:text-text-tertiary focus:outline-none"
        />
        {supported && (
          <button
            type="button"
            onClick={() => toggleListening()}
            className={cn(
              "shrink-0 flex h-8 w-8 items-center justify-center rounded-lg transition-all",
              isListening
                ? "text-gamified bg-gamified-100 animate-pulse"
                : "text-text-tertiary hover:text-foreground hover:bg-surface-2"
            )}
            aria-label={isListening ? "Stop recording" : "Start voice input"}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>
        )}
        <button
          type="button"
          onClick={() => { console.log("[Chat] send button clicked"); send() }}
          disabled={isLoading || !input.trim()}
          className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white disabled:opacity-40 transition-opacity"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
      {micFailed && (
        <p className="mt-1.5 text-center text-xs text-red-400">
          Voice blocked by browser. Try incognito mode or disable adblockers.
        </p>
      )}
    </div>
  )
}
