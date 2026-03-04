<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <div :class="cn('flex flex-col items-center justify-center py-12 text-center', props.class)">
    <div v-if="$slots.icon" class="text-muted-foreground mb-4">
      <slot name="icon" />
    </div>
    <p class="text-sm font-medium">
      <slot />
    </p>
    <p v-if="$slots.description" class="text-muted-foreground mt-1 text-xs">
      <slot name="description" />
    </p>
    <div v-if="$slots.action" class="mt-4">
      <slot name="action" />
    </div>
  </div>
</template>
