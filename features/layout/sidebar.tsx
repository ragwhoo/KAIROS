"use client"

import {
  LayoutDashboard,
  Calendar,
  ListTodo,
  Notebook,
  Sparkles,
  BarChart3,
  Settings,
} from "lucide-react"
import { SidebarItem } from "./sidebar-item"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"

const navItems = [
  { icon: LayoutDashboard, label: "Home", href: "/" },
  { icon: ListTodo, label: "Today", href: "/today" },
  { icon: Calendar, label: "Calendar", href: "/calendar" },
  { icon: Notebook, label: "Notes", href: "/notes" },
  { icon: Sparkles, label: "AI Assistant", href: "/ai" },
  { icon: BarChart3, label: "Overview", href: "/overview" },
]

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-30 flex h-full w-60 flex-col border-r border-border bg-background">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 pt-6 pb-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#7D39EB] to-[#C6FF33] text-sm font-bold text-black">
          K
        </div>
        <span className="text-lg font-bold tracking-tight">Kairos</span>
      </div>

      <Separator className="mx-4 w-auto" />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => (
          <SidebarItem
            key={item.href}
            icon={item.icon}
            label={item.label}
            href={item.href}
          />
        ))}
      </nav>

      {/* User section */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-gradient-to-br from-[#7D39EB] to-[#C6FF33] p-[2px]">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-black text-xs text-white">
                RK
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Scholar</p>
            <p className="text-xs text-text-tertiary">Level 7</p>
          </div>
          <Settings className="h-4 w-4 text-text-tertiary hover:text-foreground cursor-pointer transition-colors" />
        </div>
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-text-tertiary">1,240 XP</span>
            <span className="text-xs text-gamified font-medium">2,000</span>
          </div>
          <Progress value={62} className="h-1.5" />
        </div>
      </div>
    </aside>
  )
}
