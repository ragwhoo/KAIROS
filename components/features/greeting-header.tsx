"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"

export function GreetingHeader() {
  const [greeting, setGreeting] = useState("Evening")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting("Morning")
    else if (hour < 17) setGreeting("Afternoon")
    else setGreeting("Evening")
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="text-[40px] font-bold leading-[1.1] tracking-[-0.02em]">
          Good{" "}
          <span className="bg-gradient-to-r from-[#7D39EB] to-[#C6FF33] bg-clip-text text-transparent">
            {greeting}
          </span>
        </h1>
        <p className="mt-1.5 text-sm text-text-secondary">
          {format(new Date(), "EEEE, d MMMM")} &middot; 3 tasks remaining
        </p>
      </div>
      <div className="rounded-full bg-gradient-to-br from-[#7D39EB] to-[#C6FF33] p-[2px]">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-sm font-semibold text-white">
          RK
        </div>
      </div>
    </div>
  )
}
