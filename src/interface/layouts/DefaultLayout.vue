<script setup lang="ts">
import AppHeader from '@/interface/components/AppHeader.vue'
import AppFooter from '@/interface/components/AppFooter.vue'
import { useLayoutStore } from '../stores/layout.store'
import AppBreadcrumb from '../components/AppBreadcrumb.vue'

const { pageTitle, pageDescription } = storeToRefs(useLayoutStore())
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <AppHeader />
    <main class="flex flex-1 flex-col">
      <div class="container mx-auto px-4 pt-2 pb-8">
        <AppBreadcrumb class="my-8" />
        <div v-if="pageTitle || pageDescription">
          <h1 v-if="pageTitle" class="page-title">{{ pageTitle }}</h1>
          <h2 v-if="pageDescription" class="text-sm text-gray-600">
            {{ pageDescription }}
          </h2>
        </div>

        <div class="py-8">
          <RouterView />
        </div>
      </div>
    </main>
    <AppFooter />
  </div>
</template>
