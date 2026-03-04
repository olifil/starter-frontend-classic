<script setup lang="ts">
import { useLayoutStore } from '../stores/layout.store'

const { t } = useI18n()

const { pageTitle } = storeToRefs(useLayoutStore())

onMounted(() => {
  pageTitle.value = t('cgu.title')
})
</script>
<template>
  <section v-for="n in 10" :key="n">
    <h2 class="text-xl font-semibold mb-2">{{ $t(`cgu.s${n}.title`) }}</h2>
    <p class="text-muted-foreground">{{ $t(`cgu.s${n}.content`) }}</p>
  </section>
</template>
