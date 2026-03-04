<script setup lang="ts">
import { Eye, EyeOff } from 'lucide-vue-next'

const model = defineModel<string>({ default: '' })

defineProps<{
  id?: string
  placeholder?: string
}>()

defineEmits<{
  blur: []
}>()

const visible = ref(false)
</script>

<template>
  <div class="relative">
    <Input
      :id="id"
      v-model="model"
      :type="visible ? 'text' : 'password'"
      :placeholder="placeholder"
      class="pr-10"
      @blur="$emit('blur')"
    />
    <button
      type="button"
      class="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex items-center pr-3"
      :aria-label="visible ? $t('password.hide') : $t('password.show')"
      @click="visible = !visible"
    >
      <EyeOff v-if="visible" class="size-4" />
      <Eye v-else class="size-4" />
    </button>
  </div>
</template>
