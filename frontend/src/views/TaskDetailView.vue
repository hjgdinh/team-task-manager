<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import TaskForm from '@/components/TaskForm.vue'
import { fetchTask } from '@/api/tasks'
import { errorMessage } from '@/api/client'
import type { Task } from '@/types'

const props = defineProps<{
  id: number
}>()

const router = useRouter()
const task = ref<Task | null>(null)
const loading = ref(true)
const error = ref('')
const saved = ref(false)

onMounted(async () => {
  try {
    task.value = await fetchTask(props.id)
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    loading.value = false
  }
})

function onSaved(updated: Task) {
  task.value = updated
  saved.value = true
}
</script>

<template>
  <v-btn variant="text" prepend-icon="mdi-arrow-left" class="mb-4" :to="{ name: 'tasks' }">Back to tasks</v-btn>

  <v-row>
    <v-col cols="12" md="8" lg="6">
      <v-card :title="task ? `Edit task #${task.id}` : 'Task'" :loading="loading">
        <v-card-text>
          <v-alert v-if="error" type="error" variant="tonal" :text="error" />
          <TaskForm v-else-if="task" :key="task.updated_at" :task="task" @saved="onSaved" @cancel="router.push({ name: 'tasks' })" />
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>

  <v-snackbar v-model="saved" color="success" timeout="3000">Task saved</v-snackbar>
</template>
