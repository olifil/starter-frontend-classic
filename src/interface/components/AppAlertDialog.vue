<script setup lang="ts">
const isOpen = defineModel<boolean>('isOpen', { required: true })

const props = defineProps<{
  title: string
  description: string
  confirmButtonText: string
}>()

const emit = defineEmits<{
  confirm: []
}>()
</script>
<template>
  <AlertDialog v-model:open="isOpen">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{{ title }}</AlertDialogTitle>
        <AlertDialogDescription>{{ description }}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>{{ $t('common.cancel') }}</AlertDialogCancel>
        <AlertDialogAction @click="emit('confirm')">{{ props.confirmButtonText }}</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
