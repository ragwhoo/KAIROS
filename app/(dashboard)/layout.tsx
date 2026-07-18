"use client"

import { useRef, useLayoutEffect, useState, useEffect } from "react"
import gsap from "gsap"
import { Menu } from "lucide-react"
import { Sidebar } from "@/features/layout/sidebar"
import { ChatProvider } from "@/components/features/chat-provider"
import { FloatingChatInput } from "@/components/features/floating-chat-input"
import { ChatToast } from "@/components/features/chat-toast"
import { LenisProvider } from "@/components/features/lenis-provider"
import { useDashboardStore } from "@/store/use-dashboard-store"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const sidebarOpen = useDashboardStore((s) => s.sidebarOpen)
  const toggleSidebar = useDashboardStore((s) => s.toggleSidebar)
  const mainRef = useRef<HTMLElement>(null)

  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)")
    setIsMobile(mql.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mql.addEventListener("change", handler)
    return () => mql.removeEventListener("change", handler)
  }, [])

  useLayoutEffect(() => {
    if (!mainRef.current || isMobile) return
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
            onClick={toggleSidebar}
            className="fixed top-4 left-4 z-35 md:hidden flex h-10 w-10 items-center justify-center rounded-xl bg-surface-1 border border-border text-foreground hover:bg-surface-2 transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </button>

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
