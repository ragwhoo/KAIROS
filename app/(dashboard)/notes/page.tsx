import { ComingSoon } from "@/components/features/coming-soon"
import { PageTransition } from "@/components/features/page-transition"

export default function NotesPage() {
  return (
    <PageTransition>
      <ComingSoon
        title="Notes"
        description="Your notes, organized by subject"
      />
    </PageTransition>
  )
}
