<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const drawer = ref(true)

async function onLogout() {
  await auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <v-app>
    <template v-if="auth.isAuthenticated">
      <v-app-bar color="primary" density="comfortable">
        <v-app-bar-nav-icon @click="drawer = !drawer" />
        <v-app-bar-title>Team Task Manager</v-app-bar-title>
        <v-chip class="mr-2" variant="outlined" prepend-icon="mdi-account">
          {{ auth.user?.name }} · {{ auth.user?.role }}
        </v-chip>
        <v-btn icon="mdi-logout" title="Logout" @click="onLogout" />
      </v-app-bar>

      <v-navigation-drawer v-model="drawer">
        <v-list nav>
          <v-list-item :to="{ name: 'tasks' }" prepend-icon="mdi-format-list-checks" title="Tasks" />
          <v-list-item v-if="auth.isAdmin" :to="{ name: 'users' }" prepend-icon="mdi-account-group" title="Users" />
        </v-list>
      </v-navigation-drawer>
    </template>

    <v-main>
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>
