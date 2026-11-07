import client from './client'
import type { Paginated, Task, TaskFilters, TaskPayload } from '@/types'

export async function fetchTasks(filters: TaskFilters): Promise<Paginated<Task>> {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== null && value !== undefined && value !== ''),
  )
  const { data } = await client.get('/tasks', { params })
  return data
}

export async function fetchTask(id: number): Promise<Task> {
  const { data } = await client.get(`/tasks/${id}`)
  return data.data
}

export async function createTask(payload: TaskPayload): Promise<Task> {
  const { data } = await client.post('/tasks', payload)
  return data.data
}

export async function updateTask(id: number, payload: TaskPayload): Promise<Task> {
  const { data } = await client.put(`/tasks/${id}`, payload)
  return data.data
}

export async function deleteTask(id: number): Promise<void> {
  await client.delete(`/tasks/${id}`)
}
