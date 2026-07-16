"use client"

import useSWR from "swr"
import { fetcher, postData, putData, deleteData } from "@/lib/fetcher"
import type { Task } from "@/types"

export function useTasks() {
  const { data, error, isLoading, mutate } = useSWR<Task[]>("/api/tasks", fetcher)
  return { tasks: data ?? [], error, isLoading, mutate }
}

export async function createTask(task: Partial<Task>): Promise<Task> {
  return postData<Task>("/api/tasks", task)
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task> {
  return putData<Task>(`/api/tasks/${id}`, updates)
}

export async function deleteTask(id: string): Promise<void> {
  return deleteData(`/api/tasks/${id}`)
}
