"use client"

import useSWR from "swr"
import { fetcher } from "@/lib/fetcher"
import type { DailyMission } from "@/types"

export function useMissions() {
  const { data, error, isLoading, mutate } = useSWR<DailyMission[]>("/api/missions", fetcher)
  return { missions: data ?? [], error, isLoading, mutate }
}
