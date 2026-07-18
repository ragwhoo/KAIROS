"use client"

import useSWR from "swr"
import { fetcher } from "@/lib/fetcher"
import type { UserProgress } from "@/types"

export function useProgress() {
  const { data, error, isLoading, mutate } = useSWR<UserProgress>(
    "/api/progress",
    fetcher,
    { refreshInterval: 30000 }
  )
  return { progress: data, error, isLoading, mutate }
}
