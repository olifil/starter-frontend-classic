<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cardVariants, type CardVariants, type SemColor } from './index'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
  variant?: CardVariants['variant']
  color?: SemColor
}>()
</script>

<template>
  <!-- <div
    data-slot="card"
    :class="
      cn(
        'bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm',
        props.class,
      )
    "
  > -->
  <div
    data-slot="card"
    :data-color="props.color"
    :class="cn(cardVariants({ variant: props.variant }), props.class)"
  >
    <slot />
  </div>
</template>
