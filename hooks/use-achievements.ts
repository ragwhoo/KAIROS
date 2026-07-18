"use client"

import useSWR from "swr"
import { fetcher } from "@/lib/fetcher"
import type { Achievement } from "@/types"

export function useAchievements() {
  const { data, error, isLoading, mutate } = useSWR<Achievement[]>("/api/achievements", fetcher)
  return { achievements: data ?? [], error, isLoading, mutate }
}
