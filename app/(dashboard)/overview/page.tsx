import { ComingSoon } from "@/components/features/coming-soon"
import { PageTransition } from "@/components/features/page-transition"

export default function OverviewPage() {
  return (
    <PageTransition>
      <div className="px-4 sm:px-6 lg:px-10 pt-16 sm:pt-20 pb-20 sm:pb-28">
        <ComingSoon
          title="Overview"
          description="Analytics, progress, and achievements"
        />
      </div>
    </PageTransition>
  )
}
