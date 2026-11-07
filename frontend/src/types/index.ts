export type Role = 'admin' | 'user'

export type TaskStatus = 'todo' | 'in_progress' | 'done'

export interface User {
  id: number
  name: string
  email: string
  role: Role
}

export interface UserPayload {
  name: string
  email: string
  password: string
  role: Role
}

export interface Task {
  id: number
  title: string
  description: string | null
  status: TaskStatus
  assigned_to: number
  assignee?: User
  due_date: string | null
  created_at: string
  updated_at: string
}

export interface TaskPayload {
  title: string
  description: string | null
  status: TaskStatus
  assigned_to: number | null
  due_date: string | null
}

export interface TaskFilters {
  page: number
  per_page: number
  status?: TaskStatus | null
  assigned_to?: number | null
  search?: string | null
}

export interface Paginated<T> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export interface ValidationErrors {
  [field: string]: string[]
}

export const TASK_STATUSES: { title: string; value: TaskStatus; color: string }[] = [
  { title: 'To do', value: 'todo', color: 'grey' },
  { title: 'In progress', value: 'in_progress', color: 'blue' },
  { title: 'Done', value: 'done', color: 'green' },
]
