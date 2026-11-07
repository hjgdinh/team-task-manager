import client from './client'
import type { User, UserPayload } from '@/types'

export async function fetchUsers(): Promise<User[]> {
  const { data } = await client.get('/users')
  return data.data
}

export async function createUser(payload: UserPayload): Promise<User> {
  const { data } = await client.post('/users', payload)
  return data.data
}
