import { cn } from "@/lib/utils"

interface StatCardProps {
  label: string
  value: string | number
  accent?: "default" | "violet" | "lime"
}

export function StatCard({ label, value, accent = "default" }: StatCardProps) {
  return (
    <div className="flex-1 rounded-2xl bg-surface-1 border border-border p-4">
      <p className="text-xs font-medium uppercase tracking-[0.05em] text-text-tertiary">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 text-2xl font-bold",
          accent === "violet" && "text-primary",
          accent === "lime" && "text-gamified",
          accent === "default" && "text-foreground"
        )}
      >
        {value}
      </p>
    </div>
  )
}
