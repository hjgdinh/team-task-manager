<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import TaskForm from '@/components/TaskForm.vue'
import { deleteTask, fetchTasks } from '@/api/tasks'
import { errorMessage } from '@/api/client'
import { TASK_STATUSES } from '@/types'
import type { Task, TaskStatus } from '@/types'

const router = useRouter()

const headers = [
  { title: 'Title', key: 'title', sortable: false },
  { title: 'Assignee', key: 'assignee', sortable: false },
  { title: 'Status', key: 'status', sortable: false },
  { title: 'Due date', key: 'due_date', sortable: false },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' as const },
]

const tasks = ref<Task[]>([])
const total = ref(0)
const page = ref(1)
const perPage = ref(10)
const loading = ref(false)
const error = ref('')

const status = ref<TaskStatus | null>(null)
const search = ref('')

const createDialog = ref(false)
const taskToDelete = ref<Task | null>(null)
const deleting = ref(false)
const snackbar = ref({ show: false, text: '', color: 'success' })

function statusOf(value: TaskStatus) {
  return TASK_STATUSES.find((s) => s.value === value)!
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const result = await fetchTasks({
      page: page.value,
      per_page: perPage.value,
      status: status.value,
      search: search.value,
    })
    tasks.value = result.data
    total.value = result.meta.total
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    loading.value = false
  }
}

function onOptions(options: { page: number; itemsPerPage: number }) {
  page.value = options.page
  perPage.value = options.itemsPerPage
  load()
}

let searchTimer: ReturnType<typeof setTimeout> | undefined
watch(search, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    page.value = 1
    load()
  }, 400)
})

watch(status, () => {
  page.value = 1
  load()
})

function notify(text: string, color = 'success') {
  snackbar.value = { show: true, text, color }
}

function onCreated() {
  createDialog.value = false
  notify('Task created')
  load()
}

async function onConfirmDelete() {
  if (!taskToDelete.value) return
  deleting.value = true
  try {
    await deleteTask(taskToDelete.value.id)
    notify('Task deleted')
    taskToDelete.value = null
    load()
  } catch (e) {
    notify(errorMessage(e), 'error')
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <v-card>
    <v-card-title class="d-flex align-center flex-wrap ga-4 pa-4">
      <span>Tasks</span>
      <v-spacer />
      <v-text-field
        v-model="search"
        label="Search by title"
        prepend-inner-icon="mdi-magnify"
        density="compact"
        hide-details
        clearable
        style="max-width: 260px"
      />
      <v-select
        v-model="status"
        label="Status"
        :items="TASK_STATUSES"
        density="compact"
        hide-details
        clearable
        style="max-width: 200px"
      />
      <v-btn color="primary" prepend-icon="mdi-plus" @click="createDialog = true">New task</v-btn>
    </v-card-title>

    <v-alert v-if="error" type="error" variant="tonal" class="mx-4 mb-4" :text="error">
      <template #append>
        <v-btn variant="text" @click="load">Retry</v-btn>
      </template>
    </v-alert>

    <v-data-table-server
      :headers="headers"
      :items="tasks"
      :items-length="total"
      :loading="loading"
      :page="page"
      :items-per-page="perPage"
      :items-per-page-options="[5, 10, 25, 50]"
      no-data-text="No tasks found"
      @update:options="onOptions"
    >
      <template #item.title="{ item }">
        <router-link :to="{ name: 'task-detail', params: { id: item.id } }">{{ item.title }}</router-link>
      </template>
      <template #item.assignee="{ item }">
        {{ item.assignee?.name ?? '—' }}
      </template>
      <template #item.status="{ item }">
        <v-chip :color="statusOf(item.status).color" size="small" variant="flat">
          {{ statusOf(item.status).title }}
        </v-chip>
      </template>
      <template #item.due_date="{ item }">
        {{ item.due_date ?? '—' }}
      </template>
      <template #item.actions="{ item }">
        <v-btn
          icon="mdi-pencil"
          size="small"
          variant="text"
          @click="router.push({ name: 'task-detail', params: { id: item.id } })"
        />
        <v-btn icon="mdi-delete" size="small" variant="text" color="error" @click="taskToDelete = item" />
      </template>
    </v-data-table-server>
  </v-card>

  <v-dialog v-model="createDialog" max-width="600">
    <v-card title="New task">
      <v-card-text>
        <TaskForm v-if="createDialog" @saved="onCreated" @cancel="createDialog = false" />
      </v-card-text>
    </v-card>
  </v-dialog>

  <v-dialog :model-value="!!taskToDelete" max-width="420" @update:model-value="taskToDelete = null">
    <v-card title="Delete task">
      <v-card-text>Delete "{{ taskToDelete?.title }}"?</v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="taskToDelete = null">Cancel</v-btn>
        <v-btn color="error" :loading="deleting" @click="onConfirmDelete">Delete</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">{{ snackbar.text }}</v-snackbar>
</template>
