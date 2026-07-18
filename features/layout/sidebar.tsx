"use client"

import { useRef, useLayoutEffect, useState, useEffect } from "react"
import gsap from "gsap"
import {
  LayoutDashboard, Calendar, ListTodo, Notebook, Sparkles, BarChart3, Settings, PanelLeftClose,
} from "lucide-react"
import { SidebarItem } from "./sidebar-item"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { useDashboardStore } from "@/store/use-dashboard-store"

const navItems = [
  { icon: LayoutDashboard, label: "Home", href: "/" },
  { icon: Sparkles, label: "Chat", href: "/ai" },
  { icon: Calendar, label: "Calendar", href: "/calendar" },
  { icon: ListTodo, label: "Tasks", href: "/tasks" },
  { icon: Notebook, label: "Notes", href: "/notes" },
  { icon: BarChart3, label: "Overview", href: "/overview" },
]

export function Sidebar() {
  const sidebarOpen = useDashboardStore((s) => s.sidebarOpen)
  const toggleSidebar = useDashboardStore((s) => s.toggleSidebar)
  const asideRef = useRef<HTMLElement>(null)
  const brandTextRef = useRef<HTMLSpanElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const userInfoRef = useRef<HTMLDivElement>(null)
  const settingsRef = useRef<HTMLDivElement>(null)
  const xpBarRef = useRef<HTMLDivElement>(null)

  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)")
    setIsMobile(mql.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mql.addEventListener("change", handler)
    return () => mql.removeEventListener("change", handler)
  }, [])

  // On mobile, render nothing — MobileNav in layout handles it
  if (isMobile) return null

  // Desktop sidebar
  useLayoutEffect(() => {
    const hidden = !sidebarOpen
    gsap.set(brandTextRef.current, { opacity: hidden ? 0 : 1, x: hidden ? -10 : 0 })
    gsap.set(closeBtnRef.current, { opacity: hidden ? 0 : 1, x: hidden ? 10 : 0 })
    gsap.set(userInfoRef.current, { opacity: hidden ? 0 : 1, x: hidden ? 20 : 0 })
    gsap.set(settingsRef.current, { opacity: hidden ? 0 : 1, x: hidden ? 20 : 0 })
    gsap.set(xpBarRef.current, { opacity: hidden ? 0 : 1, height: hidden ? 0 : "auto", marginTop: hidden ? 0 : 12 })
  }, [])

  useLayoutEffect(() => {
    if (!asideRef.current) return
    gsap.to(asideRef.current, {
      width: sidebarOpen ? 240 : 64,
      duration: 0.4,
      ease: "power3.out",
    })
  }, [sidebarOpen])

  useLayoutEffect(() => {
    if (sidebarOpen) {
      gsap.to(brandTextRef.current, { opacity: 1, x: 0, duration: 0.3, ease: "power2.out" })
      gsap.to(closeBtnRef.current, { opacity: 1, x: 0, duration: 0.3, ease: "power2.out", delay: 0.05 })
      gsap.to(userInfoRef.current, { opacity: 1, x: 0, duration: 0.3, ease: "power2.out", delay: 0.1 })
      gsap.to(settingsRef.current, { opacity: 1, x: 0, duration: 0.3, ease: "power2.out", delay: 0.1 })
      gsap.to(xpBarRef.current, { opacity: 1, height: "auto", marginTop: 12, duration: 0.3, ease: "power2.out", delay: 0.15 })
    } else {
      gsap.to(brandTextRef.current, { opacity: 0, x: -10, duration: 0.2, ease: "power2.in" })
      gsap.to(closeBtnRef.current, { opacity: 0, x: 10, duration: 0.2, ease: "power2.in" })
      gsap.to(xpBarRef.current, { opacity: 0, height: 0, marginTop: 0, duration: 0.2, ease: "power2.in" })
      gsap.to(userInfoRef.current, { opacity: 0, x: 20, duration: 0.2, ease: "power2.in", delay: 0.05 })
      gsap.to(settingsRef.current, { opacity: 0, x: 20, duration: 0.2, ease: "power2.in", delay: 0.05 })
    }
  }, [sidebarOpen])

  return (
    <aside
      ref={asideRef}
      className="fixed left-0 top-0 z-30 hidden md:flex h-full flex-col border-r border-border bg-background overflow-hidden"
      style={{ width: 240 }}
    >
      <div className="flex items-center justify-between px-4 pt-6 pb-5">
        <button onClick={toggleSidebar} className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#7D39EB] to-[#C6FF33] text-sm font-bold text-black">
            K
          </div>
          <span ref={brandTextRef} className="text-lg font-bold tracking-tight whitespace-nowrap">
            Kairos
          </span>
        </button>
        <button
          ref={closeBtnRef}
          onClick={toggleSidebar}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-text-tertiary hover:text-foreground hover:bg-surface-1 transition-colors"
        >
          <PanelLeftClose className="h-4 w-4" />
        </button>
      </div>

      <Separator className="mx-4 w-auto" />

      <nav className="flex-1 space-y-1 px-2 py-4 overflow-hidden">
        {navItems.map((item) => (
          <SidebarItem key={item.href} icon={item.icon} label={item.label} href={item.href} collapsed={!sidebarOpen} />
        ))}
      </nav>

      <div className="border-t border-border pt-4 px-4 pb-2">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-gradient-to-br from-[#7D39EB] to-[#C6FF33] p-[2px] shrink-0">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-black text-xs text-white">R</AvatarFallback>
            </Avatar>
          </div>
          <div ref={userInfoRef} className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Scholar</p>
            <p className="text-xs text-text-tertiary">Level 7</p>
          </div>
          <div ref={settingsRef} className="shrink-0">
            <Settings className="h-4 w-4 text-text-tertiary hover:text-foreground cursor-pointer transition-colors" />
          </div>
        </div>
        <div ref={xpBarRef} className="overflow-hidden">
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
