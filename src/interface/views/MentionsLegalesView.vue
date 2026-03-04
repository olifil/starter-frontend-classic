<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="page-title">
      {{ $t('legal-notice.title') }}
    </h1>
    <div class="mt-8 space-y-6">
      <section v-for="n in 6" :key="n">
        <h2 class="text-xl font-semibold mb-2">
          {{ $t(`legal-notice.s${n}.title`) }}
        </h2>
        <p class="text-muted-foreground">
          {{ $t(`legal-notice.s${n}.content`) }}
        </p>
      </section>
    </div>
  </div>
</template>
