"use client"

import { motion } from "framer-motion"
import { Sidebar } from "@/features/layout/sidebar"
import { ChatInterface } from "@/components/features/chat-interface"
import { useDashboardStore } from "@/store/use-dashboard-store"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const sidebarOpen = useDashboardStore((s) => s.sidebarOpen)

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <motion.main
        animate={{ marginLeft: sidebarOpen ? 240 : 64 }}
        transition={{ type: "spring", stiffness: 300, damping: 30, mass: 1 }}
        className="flex-1 scroll-smooth"
      >
        {children}
      </motion.main>

      <ChatInterface />
    </div>
  )
}
