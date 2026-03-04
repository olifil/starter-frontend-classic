<script setup lang="ts">
import { Shield, Bell, User, Globe, Layers, Zap } from 'lucide-vue-next'
import { ROUTE_NAMES } from '@/router/route-names'
import { useAuthStore } from '@/interface/stores/auth.store'
import pkg from '../../../package.json'

const { isAuthenticated } = storeToRefs(useAuthStore())

function semver(raw: string) {
  return raw.replace(/^\^|~/, '').split('.').slice(0, 2).join('.')
}

const d = pkg.dependencies
const dd = pkg.devDependencies

const techStack = [
  `Vue ${semver(d.vue)}`,
  `TypeScript ${semver(dd.typescript)}`,
  `Vite ${semver(dd.vite)}`,
  `Pinia ${semver(d.pinia)}`,
  `Vue Router ${semver(d['vue-router'])}`,
  `Tailwind CSS v${semver(d.tailwindcss)}`,
  'shadcn-vue',
  `VueUse ${semver(d['@vueuse/core'])}`,
  `Axios ${semver(d.axios)}`,
  `vue-i18n ${semver(d['vue-i18n'])}`,
]

const features = [
  { icon: Shield, key: 'auth' },
  { icon: User, key: 'profile' },
  { icon: Bell, key: 'notifications' },
  { icon: Globe, key: 'i18n' },
  { icon: Layers, key: 'architecture' },
  { icon: Zap, key: 'stack' },
]
</script>

<template>
  <!-- Hero -->
  <section class="py-20 text-center">
    <div class="mx-auto max-w-3xl">
      <h1 class="text-5xl font-bold tracking-tight">
        {{ $t('home.hero.title') }}
      </h1>
      <p class="mt-6 text-xl leading-relaxed text-muted-foreground">
        {{ $t('home.hero.description') }}
      </p>
      <div class="mt-8 flex flex-wrap justify-center gap-4">
        <template v-if="isAuthenticated">
          <Button as-child size="lg">
            <RouterLink :to="{ name: ROUTE_NAMES.PROFILE }">
              {{ $t('header.profile') }}
            </RouterLink>
          </Button>
        </template>
        <template v-else>
          <Button as-child size="lg">
            <RouterLink :to="{ name: ROUTE_NAMES.LOGIN }">
              {{ $t('header.login') }}
            </RouterLink>
          </Button>
          <Button as-child size="lg" variant="outline">
            <RouterLink :to="{ name: ROUTE_NAMES.REGISTER }">
              {{ $t('auth.register.title') }}
            </RouterLink>
          </Button>
        </template>
      </div>
    </div>
  </section>

  <!-- Stack -->
  <section class="border-y py-8">
    <p class="mb-4 text-center text-sm font-medium text-muted-foreground">
      {{ $t('home.stack.label') }}
    </p>
    <div class="flex flex-wrap justify-center gap-2">
      <Badge v-for="tech in techStack" :key="tech" variant="secondary">
        {{ tech }}
      </Badge>
    </div>
  </section>

  <!-- Features -->
  <section class="py-16">
    <h2 class="mb-12 text-center text-3xl font-bold">
      {{ $t('home.features.title') }}
    </h2>
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <Card v-for="f in features" :key="f.key">
        <CardHeader>
          <component :is="f.icon" class="mb-2 h-8 w-8 text-primary" />
          <CardTitle>{{ $t(`home.features.${f.key}.title`) }}</CardTitle>
          <CardDescription>{{ $t(`home.features.${f.key}.description`) }}</CardDescription>
        </CardHeader>
      </Card>
    </div>
  </section>
</template>
