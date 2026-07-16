import type { ReactNode } from "react"

interface GlassPanelProps {
  title: string
  subtitle?: string
  children: ReactNode
}

export function GlassPanel({ title, subtitle, children }: GlassPanelProps) {
  return (
    <div className="glass rounded-2xl p-6 mb-6">
      <h3 className="text-xl font-semibold mb-0.5">{title}</h3>
      {subtitle && (
        <p className="text-sm text-text-secondary mb-4">{subtitle}</p>
      )}
      {children}
    </div>
  )
}
