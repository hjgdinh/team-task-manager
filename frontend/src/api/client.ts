import axios, { AxiosError } from 'axios'
import type { ValidationErrors } from '@/types'

export const TOKEN_KEY = 'auth_token'

const client = axios.create({
  baseURL: '/api',
  headers: { Accept: 'application/json' },
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

client.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && !error.config?.url?.endsWith('/login')) {
      localStorage.removeItem(TOKEN_KEY)
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export function errorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return (error.response?.data as { message?: string })?.message ?? error.message
  }
  return 'Something went wrong.'
}

export function validationErrors(error: unknown): ValidationErrors {
  if (axios.isAxiosError(error) && error.response?.status === 422) {
    return (error.response.data as { errors?: ValidationErrors }).errors ?? {}
  }
  return {}
}

export default client
