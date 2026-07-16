import { ComingSoon } from "@/components/features/coming-soon"
import { PageTransition } from "@/components/features/page-transition"

export default function AIPage() {
  return (
    <PageTransition>
      <ComingSoon
        title="AI Assistant"
        description="Your intelligent academic companion"
      />
    </PageTransition>
  )
}
