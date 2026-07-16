"use client"

import {
  LayoutDashboard,
  Calendar,
  ListTodo,
  Notebook,
  Sparkles,
  BarChart3,
  Settings,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react"
import { motion } from "framer-motion"
import { SidebarItem } from "./sidebar-item"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { useDashboardStore } from "@/store/use-dashboard-store"
import { cn } from "@/lib/utils"

const navItems = [
  { icon: LayoutDashboard, label: "Home", href: "/" },
  { icon: ListTodo, label: "Today", href: "/today" },
  { icon: Calendar, label: "Calendar", href: "/calendar" },
  { icon: Notebook, label: "Notes", href: "/notes" },
  { icon: Sparkles, label: "AI Assistant", href: "/ai" },
  { icon: BarChart3, label: "Overview", href: "/overview" },
]

export function Sidebar() {
  const sidebarOpen = useDashboardStore((s) => s.sidebarOpen)
  const toggleSidebar = useDashboardStore((s) => s.toggleSidebar)

  return (
    <motion.aside
      animate={{ width: sidebarOpen ? 240 : 64 }}
      transition={{ type: "spring", stiffness: 300, damping: 30, mass: 1 }}
      className="fixed left-0 top-0 z-30 flex h-full flex-col border-r border-border bg-background overflow-hidden"
    >
      {/* Brand */}
      <div className={cn("flex items-center pt-6 pb-5", sidebarOpen ? "justify-between px-4" : "justify-center px-2")}>
        <button
          onClick={toggleSidebar}
          className={cn(
            "flex items-center gap-2.5",
            sidebarOpen ? "min-w-0" : "flex-col"
          )}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#7D39EB] to-[#C6FF33] text-sm font-bold text-black">
            K
          </div>
          {sidebarOpen && (
            <span className="text-lg font-bold tracking-tight">Kairos</span>
          )}
        </button>
        {sidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-text-tertiary hover:text-foreground hover:bg-surface-1 transition-colors"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        )}
      </div>

      <Separator className="mx-4 w-auto" />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navItems.map((item) => (
          <SidebarItem
            key={item.href}
            icon={item.icon}
            label={item.label}
            href={item.href}
            collapsed={!sidebarOpen}
          />
        ))}
      </nav>

      {/* User section */}
      <div className={cn("border-t border-border p-4", !sidebarOpen && "px-2")}>
        <div className={cn("flex items-center", sidebarOpen ? "gap-3" : "flex-col gap-1")}>
          <div className="rounded-full bg-gradient-to-br from-[#7D39EB] to-[#C6FF33] p-[2px]">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-black text-xs text-white">
                R
              </AvatarFallback>
            </Avatar>
          </div>
          {sidebarOpen && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Scholar</p>
                <p className="text-xs text-text-tertiary">Level 7</p>
              </div>
              <Settings className="h-4 w-4 text-text-tertiary hover:text-foreground cursor-pointer transition-colors shrink-0" />
            </>
          )}
        </div>
        {sidebarOpen && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-text-tertiary">1,240 XP</span>
              <span className="text-xs text-gamified font-medium">2,000</span>
            </div>
            <Progress value={62} className="h-1.5" />
          </div>
        )}
      </div>
    </motion.aside>
  )
}
