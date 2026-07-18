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
    <div className="flex items-start justify-between mb-8 sm:mb-12">
      <div>
        <h1 className="font-bold tracking-[-0.03em] text-3xl sm:text-4xl lg:text-[72px] leading-[1.2]">
          Good {greeting},{" "}
          <span className="bg-gradient-to-r from-[#7D39EB] to-[#C6FF33] bg-clip-text text-transparent">
            Raghu
          </span>
        </h1>
        <p className="mt-2 sm:mt-4 text-sm sm:text-base text-text-secondary font-medium">
          {format(new Date(), "EEEE, d MMMM")} &middot; 3 tasks remaining
        </p>
      </div>
      <div className="rounded-full bg-gradient-to-br from-[#7D39EB] to-[#C6FF33] p-[3px] shrink-0">
        <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-black text-base sm:text-xl font-semibold text-white">
          R
        </div>
      </div>
    </div>
  )
}
