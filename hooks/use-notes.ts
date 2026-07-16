"use client"

import useSWR from "swr"
import { fetcher, postData, putData, deleteData } from "@/lib/fetcher"
import type { Note } from "@/types"

export function useNotes() {
  const { data, error, isLoading, mutate } = useSWR<Note[]>("/api/notes", fetcher)
  return { notes: data ?? [], error, isLoading, mutate }
}

export async function createNote(note: Partial<Note>): Promise<Note> {
  return postData<Note>("/api/notes", note)
}

export async function updateNote(id: string, updates: Partial<Note>): Promise<Note> {
  return putData<Note>(`/api/notes/${id}`, updates)
}

export async function deleteNote(id: string): Promise<void> {
  return deleteData(`/api/notes/${id}`)
}
