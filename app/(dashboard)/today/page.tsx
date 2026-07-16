import { ComingSoon } from "@/components/features/coming-soon"
import { PageTransition } from "@/components/features/page-transition"

export default function TodayPage() {
  return (
    <PageTransition>
      <ComingSoon
        title="Today"
        description="Your daily timeline and quick actions"
      />
    </PageTransition>
  )
}
