"use client"

import { useRef, useLayoutEffect } from "react"
import gsap from "gsap"
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
  const textRef = useRef<HTMLSpanElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (collapsed) {
      gsap.to(textRef.current, { opacity: 0, maxWidth: 0, duration: 0.15, ease: "power2.in" })
      if (dotRef.current) gsap.to(dotRef.current, { opacity: 0, maxWidth: 0, duration: 0.15, ease: "power2.in" })
    } else {
      gsap.to(textRef.current, { opacity: 1, maxWidth: 200, duration: 0.3, ease: "power2.out", delay: 0.1 })
      if (dotRef.current && isActive) {
        gsap.to(dotRef.current, { opacity: 1, maxWidth: 12, duration: 0.3, ease: "power2.out", delay: 0.15 })
      }
    }
  }, [collapsed, isActive])

  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={cn(
        "group flex items-center rounded-xl text-sm font-medium transition-colors duration-200 overflow-hidden",
        collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3.5 py-2.5",
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
      <span
        ref={textRef}
        className="whitespace-nowrap overflow-hidden"
        style={{ opacity: collapsed ? 0 : 1, maxWidth: collapsed ? 0 : 200 }}
      >
        {label}
      </span>
      <div
        ref={dotRef}
        className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 overflow-hidden"
        style={{ opacity: collapsed ? 0 : (isActive ? 1 : 0), maxWidth: collapsed ? 0 : (isActive ? 12 : 0) }}
      />
    </Link>
  )
}
