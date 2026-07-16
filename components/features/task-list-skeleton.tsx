export function TaskListSkeleton() {
  return (
    <div className="space-y-2.5">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="h-20 rounded-2xl bg-surface-1 border border-border border-l-[3px] border-l-border animate-pulse"
        />
      ))}
    </div>
  )
}
