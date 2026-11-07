import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import * as authApi from '@/api/auth'
import { TOKEN_KEY } from '@/api/client'
import type { User } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY))
  const user = ref<User | null>(null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  async function login(email: string, password: string) {
    const result = await authApi.login(email, password)
    token.value = result.token
    user.value = result.user
    localStorage.setItem(TOKEN_KEY, result.token)
  }

  async function fetchUser() {
    if (!token.value || user.value) return
    try {
      user.value = await authApi.me()
    } catch {
      clear()
    }
  }

  async function logout() {
    try {
      await authApi.logout()
    } finally {
      clear()
    }
  }

  function clear() {
    token.value = null
    user.value = null
    localStorage.removeItem(TOKEN_KEY)
  }

  return { token, user, isAuthenticated, isAdmin, login, fetchUser, logout }
})
