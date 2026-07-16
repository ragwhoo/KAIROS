import { TaskCard } from "./task-card"

const sampleTasks = [
  {
    title: "Finish DBMS Assignment",
    priority: "focus" as const,
    subject: "DBMS",
    dueText: "Due tomorrow",
    attachments: 2,
    timeEstimate: "45m",
    progress: 65,
  },
  {
    title: "Review Math Notes",
    priority: "success" as const,
    subject: "Mathematics",
    xpReward: 25,
    completed: true,
  },
  {
    title: "Submit Lab Report",
    priority: "warning" as const,
    subject: "Physics",
    dueText: "Due in 3h",
    attachments: 1,
    timeEstimate: "20m",
    progress: 40,
  },
  {
    title: "Pay Library Fine",
    priority: "danger" as const,
    dueText: "Overdue by 2 days",
    dueUrgent: true,
    progress: 25,
  },
]

export function TaskList() {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-semibold">Today&apos;s Tasks</h2>
        <button className="text-xs font-medium text-primary hover:text-primary-hover transition-colors">
          View All
        </button>
      </div>
      {sampleTasks.map((task, i) => (
        <TaskCard key={i} {...task} />
      ))}
    </div>
  )
}
