<script setup lang="ts">
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const props = defineProps<{
  totalItems: number
  totalPages: number
  page: number
  pageSize: number
  pageSizeOptions: number[]
}>()

const emit = defineEmits<{
  'update:page': [page: number]
  'update:pageSize': [size: number]
}>()
</script>

<template>
  <div class="flex justify-end mt-6">
    <Pagination
      v-if="totalPages > 1"
      :page="page"
      :total="totalItems"
      :items-per-page="pageSize"
      :sibling-count="1"
      show-edges
      @update:page="emit('update:page', $event)"
    >
      <PaginationContent v-slot="{ items }">
        <PaginationPrevious />
        <template
          v-for="item in items"
          :key="item.type === 'page' ? item.value : `ellipsis-${item.type}`"
        >
          <PaginationItem
            v-if="item.type === 'page'"
            :value="item.value"
            :is-active="item.value === page"
          >
            {{ item.value }}
          </PaginationItem>
          <PaginationEllipsis v-else />
        </template>
        <PaginationNext />
      </PaginationContent>
    </Pagination>

    <Select
      :model-value="String(pageSize)"
      @update:model-value="(v) => emit('update:pageSize', Number(v))"
    >
      <SelectTrigger class="w-28">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem
          v-for="size in pageSizeOptions"
          :key="size"
          :value="String(size)"
        >
          {{ size }}
        </SelectItem>
      </SelectContent>
    </Select>
  </div>
</template>
