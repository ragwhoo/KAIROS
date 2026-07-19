import React from "react"

export function getMessageText(parts: unknown[]): string {
  if (!Array.isArray(parts)) return ""
  return parts
    .filter((p): p is { type: string; text: string } =>
      typeof p === "object" && p !== null && "type" in p && (p as { type: string }).type === "text"
    )
    .map((p) => p.text)
    .join("")
}

export function renderLinks(text: string): React.ReactNode[] {
  const linkRegex = /\[([^\]]+)\]\((\/[^)]+)\)/g
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    parts.push(
      React.createElement(
        "a",
        {
          key: match.index,
          href: match[2],
          className: "text-primary underline underline-offset-2 hover:text-primary-100 transition-colors",
        },
        match[1]
      )
    )
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts.length > 0 ? parts : [text]
}