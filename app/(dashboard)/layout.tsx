"use client"

import { useRef, useLayoutEffect, useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import gsap from "gsap"
import { Menu, X, LayoutDashboard, Calendar, ListTodo, Notebook, Sparkles, BarChart3, Settings } from "lucide-react"
import { Sidebar } from "@/features/layout/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { ChatProvider } from "@/components/features/chat-provider"
import { FloatingChatInput } from "@/components/features/floating-chat-input"
import { ChatToast } from "@/components/features/chat-toast"
import { LenisProvider } from "@/components/features/lenis-provider"
import { useDashboardStore } from "@/store/use-dashboard-store"
import { cn } from "@/lib/utils"

const navItems = [
  { icon: LayoutDashboard, label: "Home", href: "/" },
  { icon: Sparkles, label: "Chat", href: "/ai" },
  { icon: Calendar, label: "Calendar", href: "/calendar" },
  { icon: ListTodo, label: "Tasks", href: "/tasks" },
  { icon: Notebook, label: "Notes", href: "/notes" },
  { icon: BarChart3, label: "Overview", href: "/overview" },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const sidebarOpen = useDashboardStore((s) => s.sidebarOpen)
  const mainRef = useRef<HTMLElement>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches
  )

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)")
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mql.addEventListener("change", handler)
    return () => mql.removeEventListener("change", handler)
  }, [])

  // Close mobile menu on navigation
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  useLayoutEffect(() => {
    if (!mainRef.current) return
    if (isMobile) {
      gsap.set(mainRef.current, { marginLeft: 0 })
      return
    }
    gsap.to(mainRef.current, {
      marginLeft: sidebarOpen ? 240 : 64,
      duration: 0.4,
      ease: "power3.out",
    })
  }, [sidebarOpen, isMobile])

  return (
    <LenisProvider>
      <ChatProvider>
        <div className="flex min-h-screen">
          <Sidebar />

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="fixed top-4 left-4 z-40 md:hidden flex h-10 w-10 items-center justify-center rounded-xl bg-surface-1 border border-border text-foreground hover:bg-surface-2 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Mobile full-screen nav */}
          {mobileMenuOpen && (
            <div className="fixed inset-0 z-50 md:hidden bg-background flex flex-col px-6 py-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#7D39EB] to-[#C6FF33] text-lg font-bold text-black">
                    K
                  </div>
                  <span className="text-xl font-bold tracking-tight">Kairos</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-text-tertiary hover:text-foreground hover:bg-surface-1 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <Separator className="w-auto mb-6" />

              <nav className="flex-1 space-y-1">
                {navItems.map((item) => {
                  const active = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex w-full items-center gap-4 rounded-2xl px-4 py-4 text-base font-medium transition-all",
                        active
                          ? "bg-primary-100 text-primary"
                          : "text-text-secondary hover:text-foreground hover:bg-surface-1"
                      )}
                    >
                      <item.icon className={cn("h-6 w-6 shrink-0", active && "text-primary")} />
                      <span>{item.label}</span>
                      {active && (
                        <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
                      )}
                    </Link>
                  )
                })}
              </nav>

              <Separator className="w-auto mb-6" />

              <div className="flex items-center gap-3">
                <div className="rounded-full bg-gradient-to-br from-[#7D39EB] to-[#C6FF33] p-[2px] shrink-0">
                  <Avatar className="h-11 w-11">
                    <AvatarFallback className="bg-black text-sm text-white">R</AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-medium truncate">Scholar</p>
                  <p className="text-sm text-text-tertiary">Level 7</p>
                </div>
                <Settings className="h-5 w-5 text-text-tertiary" />
              </div>
              <div className="mt-4 mb-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-text-tertiary">1,240 XP</span>
                  <span className="text-sm text-gamified font-medium">2,000</span>
                </div>
                <Progress value={62} className="h-2" />
              </div>
            </div>
          )}

          <main ref={mainRef} className="flex-1">
            {children}
          </main>
        </div>
        <FloatingChatInput />
        <ChatToast />
      </ChatProvider>
    </LenisProvider>
  )
}
