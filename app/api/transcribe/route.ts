import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const audio = formData.get("audio") as Blob | null
    if (!audio) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 })
    }

    const whisperForm = new FormData()
    whisperForm.append("model", "openai/whisper-1")
    whisperForm.append("file", audio, "recording.webm")
    whisperForm.append("language", "en")

    const res = await fetch("https://openrouter.ai/api/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      body: whisperForm,
    })

    if (!res.ok) {
      const body = await res.text()
      console.error("[Transcribe] OpenRouter error:", res.status, body)
      return NextResponse.json({ error: `Transcription failed: ${res.status}` }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json({ text: data.text })
  } catch (error) {
    console.error("[Transcribe] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
