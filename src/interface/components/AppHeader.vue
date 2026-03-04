<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { Moon, Sun, Bell, Menu } from 'lucide-vue-next'
import { useAuthStore } from '@/interface/stores/auth.store'
import { ROUTE_NAMES } from '@/router/route-names'
import { useUserStore } from '../stores/user.store'
import { useNotificationStore } from '../stores/notification.store'

const router = useRouter()
const { logout } = useAuthStore()
const { me } = storeToRefs(useUserStore())
const { isAuthenticated } = storeToRefs(useAuthStore())
const { unreadCount } = storeToRefs(useNotificationStore())

const isDark = useDark()

const loginHandler = () => router.push({ name: ROUTE_NAMES.LOGIN })
const signinHandler = () => router.push({ name: ROUTE_NAMES.REGISTER })
const logoutHandler = () => logout()
</script>

<template>
  <header class="border-b bg-background">
    <div class="container mx-auto flex h-14 items-center px-4">
      <!-- Hamburger with dropdown (mobile only) -->
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="ghost" size="icon" class="mr-2 sm:hidden" aria-label="Menu">
            <Menu class="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <template v-if="!isAuthenticated">
            <DropdownMenuItem @select="loginHandler">{{ $t('header.login') }}</DropdownMenuItem>
            <DropdownMenuItem @select="signinHandler">{{ $t('header.signIn') }}</DropdownMenuItem>
          </template>
          <template v-else>
            <DropdownMenuLabel>{{ me?.firstName }} {{ me?.lastName }}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem @select="router.push({ name: ROUTE_NAMES.PROFILE })">
                {{ $t('header.profile') }}
              </DropdownMenuItem>
              <DropdownMenuItem @select="router.push({ name: ROUTE_NAMES.NOTIFICATIONS })">
                {{ $t('notifications.title') }}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem @select="logoutHandler">{{ $t('header.logout') }}</DropdownMenuItem>
            </DropdownMenuGroup>
          </template>
        </DropdownMenuContent>
      </DropdownMenu>

      <!-- Title: centered on mobile, left on desktop -->
      <RouterLink
        to="/"
        class="flex-1 text-center text-lg font-semibold sm:flex-none sm:text-left"
      >
        {{ $t('common.appName') }}
      </RouterLink>

      <!-- Desktop nav -->
      <div class="ml-auto hidden items-center gap-2 sm:flex">
        <template v-if="!isAuthenticated">
          <Button variant="link" @click="loginHandler">{{ $t('header.login') }}</Button>
          <Button variant="link" @click="signinHandler">{{ $t('header.signIn') }}</Button>
        </template>
        <template v-else>
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button variant="link">{{ me?.firstName }} {{ me?.lastName }}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent class="w-56" align="start">
              <DropdownMenuLabel>{{ $t('header.myAccount') }}</DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem @select="router.push({ name: ROUTE_NAMES.PROFILE })">
                  {{ $t('header.profile') }}
                </DropdownMenuItem>
                <DropdownMenuItem @select="router.push({ name: ROUTE_NAMES.NOTIFICATIONS })">
                  {{ $t('notifications.title') }}
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem @select="logoutHandler">{{ $t('header.logout') }}</DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </template>

        <Button
          v-if="isAuthenticated"
          variant="ghost"
          class="relative"
          @click="router.push({ name: ROUTE_NAMES.NOTIFICATIONS })"
        >
          <Bell class="h-4 w-4 text-muted-foreground" />
          <Badge
            v-if="unreadCount > 0"
            variant="destructive"
            class="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full p-0 text-[10px]"
          >
            {{ unreadCount > 99 ? '99+' : unreadCount }}
          </Badge>
        </Button>

        <Sun class="h-4 w-4 text-muted-foreground" />
        <Switch v-model="isDark" />
        <Moon class="h-4 w-4 text-muted-foreground" />
      </div>

      <!-- Mobile: bell + dark mode on right -->
      <div class="flex items-center gap-1 sm:hidden">
        <Button
          v-if="isAuthenticated"
          variant="ghost"
          size="icon"
          class="relative"
          @click="router.push({ name: ROUTE_NAMES.NOTIFICATIONS })"
        >
          <Bell class="h-4 w-4 text-muted-foreground" />
          <Badge
            v-if="unreadCount > 0"
            variant="destructive"
            class="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full p-0 text-[10px]"
          >
            {{ unreadCount > 99 ? '99+' : unreadCount }}
          </Badge>
        </Button>

        <Sun class="h-4 w-4 text-muted-foreground" />
        <Switch v-model="isDark" />
        <Moon class="h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  </header>
</template>
