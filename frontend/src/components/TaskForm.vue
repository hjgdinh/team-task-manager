<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { createTask, updateTask } from '@/api/tasks'
import { fetchUsers } from '@/api/users'
import { errorMessage, validationErrors } from '@/api/client'
import { useAuthStore } from '@/stores/auth'
import { TASK_STATUSES } from '@/types'
import type { Task, TaskPayload, User, ValidationErrors } from '@/types'

const props = defineProps<{
  task?: Task | null
}>()

const emit = defineEmits<{
  saved: [task: Task]
  cancel: []
}>()

const auth = useAuthStore()
const isEdit = computed(() => !!props.task)

const form = reactive<TaskPayload>({
  title: props.task?.title ?? '',
  description: props.task?.description ?? null,
  status: props.task?.status ?? 'todo',
  assigned_to: props.task?.assigned_to ?? auth.user?.id ?? null,
  due_date: props.task?.due_date ?? null,
})

const users = ref<User[]>([])
const usersLoading = ref(false)
const saving = ref(false)
const formRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null)
const dateMenu = ref(false)
const error = ref('')
const errors = ref<ValidationErrors>({})

const required = (v: unknown) => (v !== null && v !== undefined && v !== '') || 'Required'

const dueDate = computed<Date | null>({
  get: () => {
    if (!form.due_date) return null
    const [y, m, d] = form.due_date.split('-').map(Number)
    return new Date(y, m - 1, d)
  },
  set: (value) => {
    form.due_date = value
      ? `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`
      : null
    dateMenu.value = false
  },
})

onMounted(async () => {
  usersLoading.value = true
  try {
    users.value = await fetchUsers()
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    usersLoading.value = false
  }
})

async function onSubmit() {
  error.value = ''
  errors.value = {}
  await nextTick()
  const result = await formRef.value?.validate()
  if (!result?.valid) return
  saving.value = true
  try {
    const task = props.task ? await updateTask(props.task.id, form) : await createTask(form)
    emit('saved', task)
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

    <v-text-field
      v-model="form.title"
      label="Title"
      :rules="[required]"
      :error-messages="errors.title"
      counter="255"
      maxlength="255"
    />

    <v-textarea
      v-model="form.description"
      label="Description"
      rows="3"
      auto-grow
      :error-messages="errors.description"
    />

    <v-select
      v-model="form.status"
      label="Status"
      :items="TASK_STATUSES"
      :rules="[required]"
      :error-messages="errors.status"
    />

    <v-select
      v-model="form.assigned_to"
      label="Assignee"
      :items="users"
      item-title="name"
      item-value="id"
      :loading="usersLoading"
      :rules="[required]"
      :error-messages="errors.assigned_to"
    />

    <v-menu v-model="dateMenu" :close-on-content-click="false">
      <template #activator="{ props: menuProps }">
        <v-text-field
          v-bind="menuProps"
          :model-value="form.due_date"
          label="Due date"
          prepend-inner-icon="mdi-calendar"
          readonly
          clearable
          :error-messages="errors.due_date"
          @click:clear="form.due_date = null"
        />
      </template>
      <v-date-picker v-model="dueDate" />
    </v-menu>

    <div class="d-flex justify-end ga-2">
      <v-btn variant="text" @click="emit('cancel')">Cancel</v-btn>
      <v-btn type="submit" color="primary" :loading="saving">
        {{ isEdit ? 'Save' : 'Create' }}
      </v-btn>
    </div>
  </v-form>
</template>
