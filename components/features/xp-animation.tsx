"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { create } from "zustand"

interface XPNotification {
  id: number
  amount: number
  x: number
  y: number
}

interface XPQueueStore {
  queue: XPNotification[]
  push: (n: XPNotification) => void
  pop: (id: number) => void
}

const useXPQueue = create<XPQueueStore>((set) => ({
  queue: [],
  push: (n) => set((s) => ({ queue: [...s.queue, n] })),
  pop: (id) => set((s) => ({ queue: s.queue.filter((q) => q.id !== id) })),
}))

let nextId = 0

export function triggerXP(amount: number, element?: HTMLElement | null) {
  const rect = element?.getBoundingClientRect()
  useXPQueue.getState().push({
    id: nextId++,
    amount,
    x: rect ? rect.left + rect.width / 2 : window.innerWidth / 2,
    y: rect ? rect.top : window.innerHeight / 2,
  })
}

export function XPAnimationContainer() {
  const queue = useXPQueue((s) => s.queue)

  if (queue.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      {queue.map((n) => (
        <XPFloat key={n.id} notification={n} />
      ))}
    </div>
  )
}

function XPFloat({ notification }: { notification: XPNotification }) {
  const ref = useRef<HTMLDivElement>(null)
  const pop = useXPQueue((s) => s.pop)

  useEffect(() => {
    if (!ref.current) return
    gsap.fromTo(
      ref.current,
      { opacity: 1, scale: 0.5, y: 0 },
      {
        opacity: 0,
        scale: 1.2,
        y: -60,
        duration: 0.9,
        ease: "power2.out",
        onComplete: () => pop(notification.id),
      }
    )
  }, [notification.id, pop])

  return (
    <div
      ref={ref}
      className="absolute text-gamified font-bold text-lg drop-shadow-lg"
      style={{ left: notification.x, top: notification.y }}
    >
      +{notification.amount} XP
    </div>
  )
}
