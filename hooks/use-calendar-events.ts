"use client"

import useSWR from "swr"
import { fetcher, postData, putData, deleteData } from "@/lib/fetcher"
import type { CalendarEvent } from "@/types"

export function useCalendarEvents() {
  const { data, error, isLoading, mutate } = useSWR<CalendarEvent[]>("/api/calendar", fetcher)
  return { events: data ?? [], error, isLoading, mutate }
}

export async function createEvent(event: Partial<CalendarEvent>): Promise<CalendarEvent> {
  return postData<CalendarEvent>("/api/calendar", event)
}

export async function updateEvent(id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent> {
  return putData<CalendarEvent>(`/api/calendar/${id}`, updates)
}

export async function deleteEvent(id: string): Promise<void> {
  return deleteData(`/api/calendar/${id}`)
}
