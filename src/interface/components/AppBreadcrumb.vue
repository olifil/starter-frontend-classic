<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { HomeIcon } from 'lucide-vue-next'
import { ROUTE_NAMES } from '@/router/route-names'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

interface BreadcrumbEntry {
  label: string
  name: string | symbol
  isHome: boolean
}

const route = useRoute()

const allowedRoutes = [
  ROUTE_NAMES.CGU,
  ROUTE_NAMES.LEGAL_NOTICE,
  ROUTE_NAMES.PROFILE,
  ROUTE_NAMES.NOTIFICATIONS,
]

const breadcrumbs = computed<BreadcrumbEntry[]>(() => {
  const crumbs: BreadcrumbEntry[] = route.matched
    .filter((r) => r.meta?.label)
    .map((r) => ({
      label: r.meta.label as string,
      name: r.name as string | symbol,
      isHome: r.name === ROUTE_NAMES.HOMEPAGE,
    }))

  if (crumbs.length > 0 && !crumbs.some((c) => c.isHome)) {
    crumbs.unshift({
      label: 'Accueil',
      name: ROUTE_NAMES.HOMEPAGE,
      isHome: true,
    })
  }

  return crumbs
})

const isBreadcrumbVisible = computed(() =>
  allowedRoutes.includes(route.name as ROUTE_NAMES),
)
</script>

<template>
  <Breadcrumb v-if="isBreadcrumbVisible">
    <BreadcrumbList>
      <template v-for="(crumb, index) in breadcrumbs" :key="String(crumb.name)">
        <BreadcrumbSeparator v-if="index > 0" />
        <BreadcrumbItem>
          <BreadcrumbPage v-if="index === breadcrumbs.length - 1">
            <HomeIcon v-if="crumb.isHome" class="size-4" aria-label="Accueil" />
            <span v-else>{{ crumb.label }}</span>
          </BreadcrumbPage>
          <BreadcrumbLink v-else as-child>
            <RouterLink :to="{ name: crumb.name }">
              <HomeIcon
                v-if="crumb.isHome"
                class="size-4"
                aria-label="Accueil"
              />
              <span v-else>{{ crumb.label }}</span>
            </RouterLink>
          </BreadcrumbLink>
        </BreadcrumbItem>
      </template>
    </BreadcrumbList>
  </Breadcrumb>
</template>
