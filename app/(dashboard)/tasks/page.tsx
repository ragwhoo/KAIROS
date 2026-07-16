import { ComingSoon } from "@/components/features/coming-soon"
import { PageTransition } from "@/components/features/page-transition"

export default function TasksPage() {
  return (
    <PageTransition>
      <ComingSoon
        title="Tasks"
        description="Manage all your tasks and assignments"
      />
    </PageTransition>
  )
}
