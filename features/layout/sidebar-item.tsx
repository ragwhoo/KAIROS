"use client"

import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { LucideIcon } from "lucide-react"

interface SidebarItemProps {
  icon: LucideIcon
  label: string
  href: string
  collapsed?: boolean
}

export function SidebarItem({ icon: Icon, label, href, collapsed }: SidebarItemProps) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={cn(
        "group flex items-center rounded-xl text-sm font-medium transition-all duration-200",
        collapsed
          ? "justify-center px-0 py-2.5"
          : "gap-3 px-3.5 py-2.5",
        isActive
          ? "bg-primary-100 text-primary"
          : "text-text-secondary hover:text-foreground hover:bg-surface-1"
      )}
    >
      <Icon
        className={cn(
          "h-5 w-5 transition-all duration-200 shrink-0",
          isActive && "text-primary"
        )}
      />
      {!collapsed && (
        <>
          <span>{label}</span>
          {isActive && (
            <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
          )}
        </>
      )}
    </Link>
  )
}
