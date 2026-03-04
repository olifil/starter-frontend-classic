<script lang="ts" setup>
import type { ToasterProps } from 'vue-sonner'
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
  XIcon,
} from 'lucide-vue-next'
import { Toaster as Sonner } from 'vue-sonner'
import { cn } from '@/lib/utils'

const props = defineProps<ToasterProps>()
</script>

<template>
  <Sonner
    :class="cn('toaster group', props.class)"
    :style="{
      '--normal-bg': 'var(--popover)',
      '--normal-text': 'var(--popover-foreground)',
      '--normal-border': 'var(--border)',
      '--border-radius': 'var(--radius)',
    }"
    v-bind="props"
  >
    <template #success-icon>
      <CircleCheckIcon class="size-4" />
    </template>
    <template #info-icon>
      <InfoIcon class="size-4" />
    </template>
    <template #warning-icon>
      <TriangleAlertIcon class="size-4" />
    </template>
    <template #error-icon>
      <OctagonXIcon class="size-4" />
    </template>
    <template #loading-icon>
      <div>
        <Loader2Icon class="size-4 animate-spin" />
      </div>
    </template>
    <template #close-icon>
      <XIcon class="size-4" />
    </template>
  </Sonner>
</template>

<style>
[data-sonner-toast][data-type='success'] {
  background: oklch(0.962 0.044 156.743) !important;
  border-color: oklch(0.792 0.209 151.711) !important;
  color: oklch(0.365 0.123 163.633) !important;
}

[data-sonner-toast][data-type='info'] {
  background: oklch(0.932 0.032 255.585) !important;
  border-color: oklch(0.707 0.165 254.624) !important;
  color: oklch(0.372 0.144 264.052) !important;
}

[data-sonner-toast][data-type='warning'] {
  background: oklch(0.987 0.026 102.212) !important;
  border-color: oklch(0.795 0.184 86.047) !important;
  color: oklch(0.476 0.114 61.907) !important;
}

[data-sonner-toast][data-type='error'] {
  background: oklch(0.971 0.013 17.38) !important;
  border-color: oklch(0.637 0.237 25.331) !important;
  color: oklch(0.444 0.177 26.899) !important;
}
</style>
