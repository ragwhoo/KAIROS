"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Send, Sparkles, Mic, MicOff, Loader2 } from "lucide-react"
import { useChatContext } from "./chat-provider"
import { cn } from "@/lib/utils"

export function FloatingChatInput() {
  const { sendMessage, status } = useChatContext()
  const [input, setInput] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [micFailed, setMicFailed] = useState(false)
  const [supported, setSupported] = useState(false)
  useEffect(() => {
    setSupported(
      typeof navigator.mediaDevices?.getUserMedia === "function" &&
      typeof MediaRecorder !== "undefined"
    )
  }, [])

  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const isLoading = status === "submitted" || status === "streaming"

  const startRecording = useCallback(async () => {
    setMicFailed(false)

    if (navigator.permissions) {
      try {
        const status = await navigator.permissions.query({ name: "microphone" as PermissionName })
        console.log("[Voice] mic permission state:", status.state)
        if (status.state === "denied") {
          console.log("[Voice] mic permanently denied")
          setMicFailed(true)
          setTimeout(() => setMicFailed(false), 8000)
          return
        }
      } catch (permErr) {
        console.log("[Voice] perm query failed:", permErr)
      }
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      console.log("[Voice] getUserMedia succeeded")
      streamRef.current = stream

      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/mp4")
          ? "audio/mp4"
          : "audio/webm"

      const recorder = new MediaRecorder(stream, { mimeType: mime })
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        streamRef.current = null

        const blob = new Blob(chunksRef.current, { type: mime })
        setIsTranscribing(true)

        try {
          const fd = new FormData()
          fd.append("audio", blob, "recording." + (mime.includes("mp4") ? "m4a" : "webm"))

          const res = await fetch("/api/transcribe", { method: "POST", body: fd })
          const data = await res.json()
          console.log("[Voice] transcribe response:", data)
          if (data.text) {
            setInput(data.text)
          } else {
            setMicFailed(true)
          }
        } catch (err) {
          console.log("[Voice] transcribe fetch error:", err)
          setMicFailed(true)
        } finally {
          setIsTranscribing(false)
        }
      }

      recorder.start()
      recorderRef.current = recorder
      setIsRecording(true)
    } catch (err) {
      console.log("[Voice] getUserMedia error:", err)
      setMicFailed(true)
      setTimeout(() => setMicFailed(false), 8000)
    }
  }, [])

  const toggleRecording = useCallback(() => {
    if (isTranscribing) return
    if (isRecording) {
      recorderRef.current?.stop()
      setIsRecording(false)
    } else {
      startRecording()
    }
  }, [isRecording, isTranscribing, startRecording])

  const send = useCallback(() => {
    const text = input.trim()
    if (!text || isLoading) return
    sendMessage({ text })
    setInput("")
  }, [input, isLoading, sendMessage])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const micIcon = isTranscribing ? (
    <Loader2 className="h-4 w-4 animate-spin" />
  ) : isRecording ? (
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
          isRecording && "border-gamified"
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
            isRecording ? "Recording..." : isTranscribing ? "Transcribing..." : isLoading ? "Kairos is thinking..." : "Ask Kairos anything..."
          }
          className="flex-1 bg-transparent text-sm placeholder:text-text-tertiary focus:outline-none"
        />
        {supported && (
          <button
            type="button"
            onClick={toggleRecording}
            disabled={isTranscribing}
            className={cn(
              "shrink-0 flex h-8 w-8 items-center justify-center rounded-lg transition-all",
              isRecording
                ? "text-gamified bg-gamified-100 animate-pulse"
                : "text-text-tertiary hover:text-foreground hover:bg-surface-2",
              isTranscribing && "opacity-50 cursor-not-allowed"
            )}
            aria-label={isRecording ? "Stop recording" : "Start voice input"}
          >
            {micIcon}
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
      {micFailed && (
        <p className="mt-1.5 text-center text-xs text-red-400">
          Voice input unavailable. Check microphone permissions and try again.
        </p>
      )}
    </div>
  )
}
