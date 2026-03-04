<script setup lang="ts">
import { cn } from '@/lib/utils'
import type { SemColor } from '@/components/ui/types'

interface Props {
  color?: SemColor
  isDisabled?: boolean
  isLoading?: boolean
  title?: string
  type?: 'button' | 'submit' | 'reset'
  isFullWidth?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  color: 'primary',
  isDisabled: false,
  isLoading: false,
  type: 'button',
  isFullWidth: false,
})
</script>
<template>
  <Button
    :color="props.color"
    :class="cn(props.isFullWidth ? 'w-full' : 'w-auto')"
    :disabled="props.isDisabled || props.isLoading"
    :type
  >
    <Spinner v-if="props.isLoading" />
    <span v-else>{{ props.title }}</span>
  </Button>
</template>
