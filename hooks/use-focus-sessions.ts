"use client"

import useSWR from "swr"
import { fetcher, postData } from "@/lib/fetcher"
import type { FocusSession } from "@/types"

export function useFocusSessions() {
  const { data, error, isLoading, mutate } = useSWR<FocusSession[]>("/api/focus-sessions", fetcher)
  return { sessions: data ?? [], error, isLoading, mutate }
}

export async function createFocusSession(data: Partial<FocusSession>): Promise<FocusSession> {
  return postData<FocusSession>("/api/focus-sessions", data)
}
