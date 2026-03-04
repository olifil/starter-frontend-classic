<script setup lang="ts">
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'

interface ActionOption {
  value: string
  label: string
}
const { t } = useI18n()
const props = defineProps<{
  allSelected: boolean
  someSelected: boolean
  selectedCount: number
  actions: ActionOption[]
  placeholder?: string
  applyLabel?: string
}>()

const emit = defineEmits<{
  toggleSelectAll: []
  apply: [action: string]
}>()

const selectedAction = ref('')

function handleApply() {
  if (!selectedAction.value || props.selectedCount === 0) return
  emit('apply', selectedAction.value)
  selectedAction.value = ''
}
</script>

<template>
  <div class="flex items-center gap-3">
    <Checkbox
      :model-value="allSelected ? true : someSelected ? 'indeterminate' : false"
      :title="t('common.selectAll')"
      @update:model-value="emit('toggleSelectAll')"
    />
    <Select v-model="selectedAction">
      <SelectTrigger class="w-52">
        <SelectValue :placeholder="placeholder" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem
          v-for="action in actions"
          :key="action.value"
          :value="action.value"
        >
          {{ action.label }}
        </SelectItem>
      </SelectContent>
    </Select>
    <Button
      variant="outline"
      :disabled="!selectedAction || selectedCount === 0"
      @click="handleApply"
    >
      {{ applyLabel }}
    </Button>
    <span v-if="selectedCount > 0" class="text-muted-foreground text-sm">
      <slot name="count">{{ selectedCount }}</slot>
    </span>
  </div>
</template>
