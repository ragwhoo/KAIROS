import { ComingSoon } from "@/components/features/coming-soon"
import { PageTransition } from "@/components/features/page-transition"

export default function OverviewPage() {
  return (
    <PageTransition>
      <ComingSoon
        title="Overview"
        description="Analytics, progress, and achievements"
      />
    </PageTransition>
  )
}
