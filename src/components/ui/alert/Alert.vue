<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { AlertVariants, SemColor } from '.'
import { cn } from '@/lib/utils'
import { alertVariants } from '.'

const props = defineProps<{
  class?: HTMLAttributes['class']
  variant?: AlertVariants['variant']
  color?: SemColor
}>()
</script>

<template>
  <div
    data-slot="alert"
    :data-color="props.color"
    :class="cn(alertVariants({ variant }), props.class)"
    role="alert"
  >
    <slot />
  </div>
</template>
