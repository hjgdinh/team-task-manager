<script setup lang="ts">
import { nextTick, reactive, ref } from 'vue'
import { createUser } from '@/api/users'
import { errorMessage, validationErrors } from '@/api/client'
import type { User, UserPayload, ValidationErrors } from '@/types'

const emit = defineEmits<{
  saved: [user: User]
  cancel: []
}>()

const roles = [
  { title: 'User', value: 'user' },
  { title: 'Admin', value: 'admin' },
]

const form = reactive<UserPayload>({
  name: '',
  email: '',
  password: '',
  role: 'user',
})

const formRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null)
const saving = ref(false)
const error = ref('')
const errors = ref<ValidationErrors>({})

const rules = {
  required: (v: string) => !!v || 'Required',
  email: (v: string) => /.+@.+\..+/.test(v) || 'Invalid email',
  min: (v: string) => v.length >= 8 || 'At least 8 characters',
}

async function onSubmit() {
  error.value = ''
  errors.value = {}
  await nextTick()
  const result = await formRef.value?.validate()
  if (!result?.valid) return
  saving.value = true
  try {
    emit('saved', await createUser(form))
  } catch (e) {
    errors.value = validationErrors(e)
    if (!Object.keys(errors.value).length) error.value = errorMessage(e)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <v-form ref="formRef" @submit.prevent="onSubmit">
    <v-alert v-if="error" type="error" variant="tonal" class="mb-4" :text="error" />

    <v-text-field v-model="form.name" label="Name" :rules="[rules.required]" :error-messages="errors.name" />
    <v-text-field
      v-model="form.email"
      label="Email"
      type="email"
      :rules="[rules.required, rules.email]"
      :error-messages="errors.email"
    />
    <v-text-field
      v-model="form.password"
      label="Password"
      type="password"
      autocomplete="new-password"
      :rules="[rules.required, rules.min]"
      :error-messages="errors.password"
    />
    <v-select v-model="form.role" label="Role" :items="roles" :error-messages="errors.role" />

    <div class="d-flex justify-end ga-2">
      <v-btn variant="text" @click="emit('cancel')">Cancel</v-btn>
      <v-btn type="submit" color="primary" :loading="saving">Create</v-btn>
    </div>
  </v-form>
</template>
