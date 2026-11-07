<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { errorMessage, validationErrors } from '@/api/client'
import type { ValidationErrors } from '@/types'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const errors = ref<ValidationErrors>({})
const formRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null)

const rules = {
  required: (v: string) => !!v || 'Required',
  email: (v: string) => /.+@.+\..+/.test(v) || 'Invalid email',
}

async function onSubmit() {
  error.value = ''
  errors.value = {}
  await nextTick()
  const result = await formRef.value?.validate()
  if (!result?.valid) return
  loading.value = true
  try {
    await auth.login(email.value, password.value)
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/tasks'
    router.push(redirect)
  } catch (e) {
    errors.value = validationErrors(e)
    if (!Object.keys(errors.value).length) error.value = errorMessage(e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-row justify="center" align="center" class="fill-height mt-16">
    <v-col cols="12" sm="8" md="5" lg="4">
      <v-card title="Sign in" class="pa-2">
        <v-card-text>
          <v-alert v-if="error" type="error" variant="tonal" class="mb-4" :text="error" />
          <v-form ref="formRef" @submit.prevent="onSubmit">
            <v-text-field
              v-model="email"
              label="Email"
              type="email"
              autocomplete="username"
              :rules="[rules.required, rules.email]"
              :error-messages="errors.email"
            />
            <v-text-field
              v-model="password"
              label="Password"
              type="password"
              autocomplete="current-password"
              :rules="[rules.required]"
              :error-messages="errors.password"
            />
            <v-btn type="submit" color="primary" block :loading="loading">Login</v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>
