import { Button } from "@/components/ui/button"
import { Plus, ListChecks, BarChart3 } from "lucide-react"

export function CTARow() {
  return (
    <div className="flex gap-2 mb-6">
      <Button variant="primary" size="default" className="flex-1 gap-2">
        <ListChecks className="h-4 w-4" />
        View Today
      </Button>
      <Button variant="gamified" size="default" className="flex-1 gap-2">
        <Plus className="h-4 w-4" />
        Quick Task
      </Button>
      <Button variant="secondary" size="default" className="flex-1 gap-2">
        <BarChart3 className="h-4 w-4" />
        Overview
      </Button>
    </div>
  )
}
