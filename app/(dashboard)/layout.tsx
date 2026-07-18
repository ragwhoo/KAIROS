"use client"

import { useRef, useLayoutEffect, useState, useEffect, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
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
  const router = useRouter()
  const pathname = usePathname()

  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)")
    setIsMobile(mql.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mql.addEventListener("change", handler)
    return () => mql.removeEventListener("change", handler)
  }, [])

  // Close mobile menu on navigation
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  // Desktop margin animation
  useLayoutEffect(() => {
    if (!mainRef.current || isMobile) return
    gsap.to(mainRef.current, {
      marginLeft: sidebarOpen ? 240 : 64,
      duration: 0.4,
      ease: "power3.out",
    })
  }, [sidebarOpen, isMobile])

  const handleNav = useCallback(
    (href: string) => {
      setMobileMenuOpen(false)
      router.push(href)
    },
    [router]
  )

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

          {/* Mobile nav overlay */}
          {mobileMenuOpen && (
            <div className="fixed inset-0 z-50 md:hidden">
              <div
                className="absolute inset-0 bg-black/60"
                onClick={() => setMobileMenuOpen(false)}
              />
              <div className="absolute left-0 top-0 bottom-0 w-[280px] bg-background border-r border-border flex flex-col">
                <div className="flex items-center justify-between px-4 pt-6 pb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#7D39EB] to-[#C6FF33] text-sm font-bold text-black">
                      K
                    </div>
                    <span className="text-lg font-bold tracking-tight">Kairos</span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-text-tertiary hover:text-foreground hover:bg-surface-1 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <Separator className="mx-4 w-auto" />

                <nav className="flex-1 space-y-1 px-2 py-4">
                  {navItems.map((item) => {
                    const active = pathname === item.href
                    return (
                      <button
                        key={item.href}
                        onClick={() => handleNav(item.href)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                          active
                            ? "bg-primary-100 text-primary"
                            : "text-text-secondary hover:text-foreground hover:bg-surface-1"
                        )}
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        <span>{item.label}</span>
                        {active && (
                          <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                        )}
                      </button>
                    )
                  })}
                </nav>

                <div className="border-t border-border pt-4 px-4 pb-2">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-gradient-to-br from-[#7D39EB] to-[#C6FF33] p-[2px] shrink-0">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-black text-xs text-white">R</AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">Scholar</p>
                      <p className="text-xs text-text-tertiary">Level 7</p>
                    </div>
                    <Settings className="h-4 w-4 text-text-tertiary shrink-0" />
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-text-tertiary">1,240 XP</span>
                      <span className="text-xs text-gamified font-medium">2,000</span>
                    </div>
                    <Progress value={62} className="h-1.5" />
                  </div>
                </div>
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
