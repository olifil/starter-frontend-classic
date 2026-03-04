<script setup lang="ts">
import { useAuthStore } from '@/interface/stores/auth.store'
import { useUserStore } from '@/interface/stores/user.store'
import { useNotificationStore } from '@/interface/stores/notification.store'

const authStore = useAuthStore()
const userStore = useUserStore()

if (authStore.isAuthenticated) {
  userStore.getMe()
}

useNotificationStore()
</script>

<template>
  <RouterView />
  <Toaster />
</template>
