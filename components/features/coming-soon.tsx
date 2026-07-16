import { Construction } from "lucide-react"

interface ComingSoonProps {
  title: string
  description: string
}

export function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="mx-auto max-w-[680px] px-8 py-16">
      <div className="flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-border p-16">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 mb-4">
          <Construction className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-1">{title}</h1>
        <p className="text-sm text-text-secondary">{description}</p>
        <p className="text-xs text-text-tertiary mt-6">Coming in Phase 2</p>
      </div>
    </div>
  )
}
