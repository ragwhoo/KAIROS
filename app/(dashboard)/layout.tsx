"use client"

import { useRef, useLayoutEffect, useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import gsap from "gsap"
import { Menu, X, LayoutDashboard, Calendar, ListTodo, Notebook, Sparkles, BarChart3, Settings } from "lucide-react"
import { Sidebar } from "@/features/layout/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { ChatProvider } from "@/components/features/chat-provider"
import { FloatingChatInput } from "@/components/features/floating-chat-input"
import { ChatToast } from "@/components/features/chat-toast"
import { XPAnimationContainer } from "@/components/features/xp-animation"
import { AchievementUnlock } from "@/components/features/achievement-unlock"
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
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 z-50 md:hidden bg-background flex flex-col px-6 py-8"
              >
                <motion.div
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08, duration: 0.2 }}
                  className="flex items-center justify-between mb-8"
                >
                  <div className="flex items-center gap-3">
                    <motion.div
                      whileTap={{ scale: 0.9 }}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#7D39EB] to-[#C6FF33] text-lg font-bold text-black"
                    >
                      K
                    </motion.div>
                    <span className="text-xl font-bold tracking-tight">Kairos</span>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-text-tertiary hover:text-foreground hover:bg-surface-1 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </motion.button>
                </motion.div>

                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  exit={{ scaleX: 0 }}
                  transition={{ delay: 0.12, duration: 0.3 }}
                  style={{ originX: 0 }}
                  className="h-px bg-border mb-6"
                />

                <nav className="flex-1 space-y-1">
                  {navItems.map((item, i) => {
                    const active = pathname === item.href
                    return (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: 0.12 + i * 0.04, duration: 0.2 }}
                      >
                        <Link
                          href={item.href}
                          className={cn(
                            "flex w-full items-center gap-4 rounded-2xl px-4 py-4 text-base font-medium transition-colors",
                            active
                              ? "bg-primary-100 text-primary"
                              : "text-text-secondary active:bg-surface-1 active:scale-[0.98]"
                          )}
                          style={{ WebkitTapHighlightColor: "transparent" }}
                        >
                          <item.icon className={cn("h-6 w-6 shrink-0", active && "text-primary")} />
                          <span>{item.label}</span>
                          {active && (
                            <motion.div
                              layoutId="mobileNavDot"
                              className="ml-auto h-2 w-2 rounded-full bg-primary"
                            />
                          )}
                        </Link>
                      </motion.div>
                    )
                  })}
                </nav>

                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  exit={{ scaleX: 0 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                  style={{ originX: 0 }}
                  className="h-px bg-border mb-6"
                />

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ delay: 0.32, duration: 0.2 }}
                >
                  <div className="flex items-center gap-3">
                    <motion.div
                      whileTap={{ scale: 0.95 }}
                      className="rounded-full bg-gradient-to-br from-[#7D39EB] to-[#C6FF33] p-[2px] shrink-0"
                    >
                      <Avatar className="h-11 w-11">
                        <AvatarFallback className="bg-black text-sm text-white">R</AvatarFallback>
                      </Avatar>
                    </motion.div>
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
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <main ref={mainRef} className="flex-1">
            {children}
          </main>
        </div>
        <FloatingChatInput />
        <ChatToast />
        <XPAnimationContainer />
        <AchievementUnlock />
      </ChatProvider>
    </LenisProvider>
  )
}
