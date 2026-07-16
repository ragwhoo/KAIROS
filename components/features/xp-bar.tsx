import { Progress } from "@/components/ui/progress"

export function XPBar() {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="flex items-center gap-1.5 rounded-full bg-primary-100 border border-primary-100 pr-3">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#7D39EB] to-[#C6FF33] text-[10px] font-bold text-black">
          7
        </div>
        <span className="text-xs font-semibold text-primary">Scholar</span>
      </div>
      <Progress value={62} className="flex-1 h-1.5" />
      <span className="text-xs font-semibold text-gamified whitespace-nowrap">
        1,240 / 2,000 XP
      </span>
    </div>
  )
}
