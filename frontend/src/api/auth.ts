import client from './client'
import type { User } from '@/types'

export async function login(email: string, password: string): Promise<{ token: string; user: User }> {
  const { data } = await client.post('/login', { email, password })
  return { token: data.token, user: data.user }
}

export async function me(): Promise<User> {
  const { data } = await client.get('/me')
  return data.data
}

export async function logout(): Promise<void> {
  await client.post('/logout')
}
