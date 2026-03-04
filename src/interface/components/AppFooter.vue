<script setup lang="ts">
import { ROUTE_NAMES } from '@/router/route-names'
import { Mail } from 'lucide-vue-next'
</script>
<template>
  <footer class="border-t bg-background py-4">
    <div
      class="container mx-auto px-4 flex items-center justify-center text-sm text-muted-foreground"
    >
      <p>&copy; {{ new Date().getFullYear() }} {{ $t('common.appName') }}</p>

      <RouterLink
        class="mx-2"
        :title="$t('common.contact')"
        :to="{ name: ROUTE_NAMES.CONTACT }"
      >
        <Mail />
      </RouterLink>
      |
      <RouterLink
        class="mx-2"
        :title="$t('cgu.title')"
        :to="{ name: ROUTE_NAMES.CGU }"
      >
        {{ $t('cgu.title') }}
      </RouterLink>
      |
      <RouterLink
        class="mx-2"
        :title="$t('legal-notice.title')"
        :to="{ name: ROUTE_NAMES.LEGAL_NOTICE }"
      >
        {{ $t('legal-notice.title') }}
      </RouterLink>
    </div>
  </footer>
</template>
