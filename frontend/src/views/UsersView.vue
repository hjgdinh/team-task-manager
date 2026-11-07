<script setup lang="ts">
import { onMounted, ref } from 'vue'
import UserForm from '@/components/UserForm.vue'
import { fetchUsers } from '@/api/users'
import { errorMessage } from '@/api/client'
import type { User } from '@/types'

const headers = [
  { title: 'Name', key: 'name' },
  { title: 'Email', key: 'email' },
  { title: 'Role', key: 'role' },
]

const users = ref<User[]>([])
const loading = ref(false)
const error = ref('')
const dialog = ref(false)
const created = ref(false)

async function load() {
  loading.value = true
  error.value = ''
  try {
    users.value = await fetchUsers()
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    loading.value = false
  }
}

function onCreated() {
  dialog.value = false
  created.value = true
  load()
}

onMounted(load)
</script>

<template>
  <v-card>
    <v-card-title class="d-flex align-center pa-4">
      <span>Users</span>
      <v-spacer />
      <v-btn color="primary" prepend-icon="mdi-plus" @click="dialog = true">New user</v-btn>
    </v-card-title>

    <v-alert v-if="error" type="error" variant="tonal" class="mx-4 mb-4" :text="error" />

    <v-data-table :headers="headers" :items="users" :loading="loading" no-data-text="No users found">
      <template #item.role="{ item }">
        <v-chip :color="item.role === 'admin' ? 'primary' : 'grey'" size="small" variant="flat">{{ item.role }}</v-chip>
      </template>
    </v-data-table>
  </v-card>

  <v-dialog v-model="dialog" max-width="500">
    <v-card title="New user">
      <v-card-text>
        <UserForm v-if="dialog" @saved="onCreated" @cancel="dialog = false" />
      </v-card-text>
    </v-card>
  </v-dialog>

  <v-snackbar v-model="created" color="success" timeout="3000">User created</v-snackbar>
</template>
