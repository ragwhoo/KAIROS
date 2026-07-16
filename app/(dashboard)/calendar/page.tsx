import { ComingSoon } from "@/components/features/coming-soon"
import { PageTransition } from "@/components/features/page-transition"

export default function CalendarPage() {
  return (
    <PageTransition>
      <ComingSoon
        title="Calendar"
        description="Your schedule, deadlines, and events"
      />
    </PageTransition>
  )
}
