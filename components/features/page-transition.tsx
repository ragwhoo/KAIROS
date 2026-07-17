"use client"

import { useRef, useLayoutEffect, type ReactNode } from "react"
import gsap from "gsap"

interface PageTransitionProps {
  children: ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!ref.current) return
    gsap.fromTo(ref.current, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" })
  }, [])

  return <div ref={ref}>{children}</div>
}
