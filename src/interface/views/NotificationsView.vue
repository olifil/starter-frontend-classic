<script setup lang="ts">
import {
  NotificationPageSize,
  NotificationStatus,
} from '@/core/domain/types/notification.types'
import type { Notification } from '@/core/domain/types/notification.types'
import { useLayoutStore } from '../stores/layout.store'
import { useNotificationStore } from '../stores/notification.store'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { EllipsisVertical, Inbox } from 'lucide-vue-next'
import { Empty } from '@/components/ui/empty'
import AppBulkActionsToolbar from '@/interface/components/AppBulkActionsToolbar.vue'
import AppPaginationBar from '@/interface/components/AppPaginationBar.vue'

const { t, locale } = useI18n()
const { pageTitle, pageDescription } = storeToRefs(useLayoutStore())
const notificationStore = useNotificationStore()
const { markAsRead, deleteNotification, getNotifications } = notificationStore
const { lastNotification, notifications } = storeToRefs(notificationStore)

const currentPage = ref(1)
const pageSize = ref<NotificationPageSize>(NotificationPageSize.Default)
const selectedNotification = ref<Notification | null>(null)
const dialogOpen = ref(false)
const notificationToDelete = ref<Notification | null>(null)
const deleteDialogOpen = ref(false)

// Bulk actions
const selectedIds = ref<Set<string>>(new Set())
const bulkDeleteDialogOpen = ref(false)

const pageSizeOptions = [
  NotificationPageSize.Small,
  NotificationPageSize.Medium,
  NotificationPageSize.Large,
]

const currentNotifications = computed(() => notifications.value?.data ?? [])

const allSelected = computed(
  () =>
    currentNotifications.value.length > 0 &&
    currentNotifications.value.every((n) => selectedIds.value.has(n.id)),
)

const someSelected = computed(
  () =>
    currentNotifications.value.some((n) => selectedIds.value.has(n.id)) &&
    !allSelected.value,
)

const selectedCount = computed(() => selectedIds.value.size)

function toggleSelectAll() {
  if (allSelected.value) {
    selectedIds.value = new Set()
  } else {
    selectedIds.value = new Set(currentNotifications.value.map((n) => n.id))
  }
}

function toggleSelect(id: string) {
  const next = new Set(selectedIds.value)
  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }
  selectedIds.value = next
}

function handleBulkApply(action: string) {
  if (action === 'delete') {
    bulkDeleteDialogOpen.value = true
  } else {
    confirmBulkMarkAsRead()
  }
}

async function confirmBulkMarkAsRead() {
  const toMark = currentNotifications.value.filter(
    (n) => selectedIds.value.has(n.id) && n.status === NotificationStatus.SENT,
  )
  for (const n of toMark) {
    await markAsRead(n.id)
    n.status = NotificationStatus.READ
  }
  selectedIds.value = new Set()
}

async function confirmBulkDelete() {
  const toDelete = currentNotifications.value.filter((n) =>
    selectedIds.value.has(n.id),
  )
  for (const n of toDelete) {
    await deleteNotification(n.id, n.status === NotificationStatus.SENT)
  }
  selectedIds.value = new Set()
  await getNotifications(currentPage.value, pageSize.value)
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat(locale.value, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

async function openNotification(notification: Notification) {
  selectedNotification.value = notification
  dialogOpen.value = true
  if (notification.status === NotificationStatus.SENT) {
    await markAsRead(notification.id)
    notification.status = NotificationStatus.READ
  }
}

async function handleMarkAsRead(notification: Notification) {
  await markAsRead(notification.id)
  notification.status = NotificationStatus.READ
}

function handleDelete(notification: Notification) {
  notificationToDelete.value = notification
  deleteDialogOpen.value = true
}

async function confirmDelete() {
  if (!notificationToDelete.value) return
  await deleteNotification(
    notificationToDelete.value.id,
    notificationToDelete.value.status === NotificationStatus.SENT,
  )
  notificationToDelete.value = null
  await getNotifications(currentPage.value, pageSize.value)
}

watch(currentPage, (page) => {
  selectedIds.value = new Set()
  getNotifications(page, pageSize.value)
})

watch(lastNotification, (notification) => {
  if (!notification) return
  if (currentPage.value !== 1) {
    currentPage.value = 1 // déclenche watch(currentPage) → getNotifications(1)
  } else {
    getNotifications(1, pageSize.value)
  }
})

watch(pageSize, () => {
  currentPage.value = 1
  selectedIds.value = new Set()
  getNotifications(1, pageSize.value)
})

onMounted(async () => {
  pageTitle.value = t('notifications.title')
  pageDescription.value = t('notifications.description')
  await getNotifications(1, pageSize.value)
})
</script>

<template>
  <div class="mt-8 space-y-4">
    <Empty v-if="notifications && notifications.data.length === 0">
      <template #icon>
        <Inbox class="h-10 w-10" />
      </template>
      {{ $t('notifications.empty') }}
    </Empty>

    <!-- Bulk actions toolbar -->
    <AppBulkActionsToolbar
      v-if="currentNotifications.length > 0"
      :all-selected="allSelected"
      :some-selected="someSelected"
      :selected-count="selectedCount"
      :actions="[
        {
          value: 'markAsRead',
          label: $t('notifications.bulkActions.markAsRead'),
        },
        { value: 'delete', label: $t('notifications.bulkActions.delete') },
      ]"
      :placeholder="$t('notifications.bulkActions.placeholder')"
      :apply-label="$t('notifications.bulkActions.apply')"
      @toggle-select-all="toggleSelectAll"
      @apply="handleBulkApply"
    >
      <template #count>
        {{ $t('notifications.bulkActions.selected', { count: selectedCount }) }}
      </template>
    </AppBulkActionsToolbar>

    <Card
      v-for="notification in notifications?.data"
      :key="notification.id"
      class="cursor-pointer p-2 transition-opacity hover:opacity-80"
      :color="
        notification.status === NotificationStatus.SENT ? 'info' : undefined
      "
      @click="openNotification(notification)"
    >
      <CardHeader class="flex flex-row items-start justify-between space-y-0">
        <div class="flex items-start gap-3 flex-1 min-w-0">
          <Checkbox
            :model-value="selectedIds.has(notification.id)"
            class="mt-0.5 shrink-0"
            @update:model-value="toggleSelect(notification.id)"
            @click.stop
          />
          <div class="flex-1 min-w-0">
            <CardTitle class="text-sm">{{ notification.subject }}</CardTitle>
            <CardDescription v-if="notification.sentAt" class="text-xs">
              {{ formatDate(notification.sentAt) }}
            </CardDescription>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button
              variant="ghost"
              size="icon"
              class="h-6 w-6 shrink-0"
              @click.stop
            >
              <EllipsisVertical class="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem @select="openNotification(notification)">
              {{ $t('notifications.open') }}
            </DropdownMenuItem>
            <DropdownMenuItem
              :disabled="notification.status !== NotificationStatus.SENT"
              @select="handleMarkAsRead(notification)"
            >
              {{ $t('notifications.markAsRead') }}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              class="text-destructive focus:text-destructive"
              @select="handleDelete(notification)"
            >
              {{ $t('notifications.delete') }}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
    </Card>
    <AppPaginationBar
      :page="currentPage"
      :total-items="notifications?.meta.totalItems ?? 0"
      :total-pages="notifications?.meta.totalPages ?? 0"
      :page-size="pageSize"
      :page-size-options="pageSizeOptions"
      @update:page="currentPage = $event"
      @update:page-size="pageSize = $event as NotificationPageSize"
    />
  </div>

  <!-- Single delete confirmation -->
  <AppAlertDialog
    v-model:isOpen="deleteDialogOpen"
    :title="$t('notifications.deleteConfirm.title')"
    :description="$t('notifications.deleteConfirm.description')"
    :confirm-button-text="$t('notifications.deleteConfirm.confirm')"
    @confirm="confirmDelete"
  />

  <!-- Bulk delete confirmation -->
  <AppAlertDialog
    v-model:isOpen="bulkDeleteDialogOpen"
    :title="$t('notifications.bulkDeleteConfirm.title')"
    :description="
      $t('notifications.bulkDeleteConfirm.description', {
        count: selectedCount,
      })
    "
    :confirm-button-text="$t('notifications.bulkDeleteConfirm.confirm')"
    @confirm="confirmBulkDelete"
  />

  <Dialog v-model:open="dialogOpen">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ selectedNotification?.subject }}</DialogTitle>
        <DialogDescription v-if="selectedNotification?.sentAt">
          {{ formatDate(selectedNotification.sentAt) }}
        </DialogDescription>
      </DialogHeader>
      <p class="text-sm" v-html="selectedNotification?.body"></p>
    </DialogContent>
  </Dialog>
</template>
