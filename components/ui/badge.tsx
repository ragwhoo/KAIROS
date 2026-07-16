import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-xs font-semibold transition-colors duration-200",
  {
    variants: {
      variant: {
        focus: "bg-primary-100 text-primary",
        success: "bg-gamified-100 text-gamified",
        warning: "bg-[rgba(255,159,10,0.12)] text-warning",
        danger: "bg-[rgba(255,59,92,0.12)] text-destructive",
        subject: "bg-surface-1 text-text-secondary",
        outline: "border border-border text-text-secondary",
      },
    },
    defaultVariants: {
      variant: "subject",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
