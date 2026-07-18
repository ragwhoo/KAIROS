"use client"

import { useRef, useLayoutEffect } from "react"
import gsap from "gsap"
import { Sidebar } from "@/features/layout/sidebar"
import { LenisProvider } from "@/components/features/lenis-provider"
import { useDashboardStore } from "@/store/use-dashboard-store"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const sidebarOpen = useDashboardStore((s) => s.sidebarOpen)
  const mainRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    if (!mainRef.current) return
    gsap.to(mainRef.current, {
      marginLeft: sidebarOpen ? 240 : 64,
      duration: 0.4,
      ease: "power3.out",
    })
  }, [sidebarOpen])

  return (
    <LenisProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <main ref={mainRef} className="flex-1">
          {children}
        </main>
      </div>
    </LenisProvider>
  )
}
