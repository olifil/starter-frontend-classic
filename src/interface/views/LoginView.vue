<script setup lang="ts">
import PasswordInput from '@/interface/components/PasswordInput.vue'
import { useAuthStore } from '../stores/auth.store'
import MainButton from '../components/MainButton.vue'
import { ROUTE_NAMES } from '@/router/route-names'
import { useLayoutStore } from '../stores/layout.store'

const { t } = useI18n()
const authStore = useAuthStore()
const loading = toRef(authStore, 'loading')
const { pageTitle, pageDescription } = storeToRefs(useLayoutStore())

const email = ref('')
const password = ref('')

const touched = reactive({ email: false, password: false })

const errors = computed(() => ({
  email: !email.value.trim()
    ? t('validation.emailRequired')
    : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())
      ? t('validation.emailInvalid')
      : '',
  password: !password.value ? t('validation.passwordRequired') : '',
}))

const isValid = computed(() => !errors.value.email && !errors.value.password)

const onSubmit = async () => {
  if (!isValid.value) return
  authStore.login({ email: email.value, password: password.value })
}

onMounted(() => {
  pageTitle.value = t('auth.login.title')
  pageDescription.value = t('auth.login.description')
})
</script>

<template>
  <Card class="w-full max-w-md">
    <form @submit.prevent="onSubmit">
      <CardContent class="space-y-4">
        <div class="space-y-2">
          <Label for="email">{{ $t('field.email') }}</Label>
          <Input
            id="email"
            v-model="email"
            type="email"
            :placeholder="$t('field.emailPlaceholder')"
            @blur="touched.email = true"
          />
          <p
            v-if="touched.email && errors.email"
            class="composablestext-sm text-destructive"
          >
            {{ errors.email }}
          </p>
        </div>
        <div class="space-y-2">
          <Label for="password">{{ $t('field.password') }}</Label>
          <PasswordInput
            id="password"
            v-model="password"
            :placeholder="$t('field.passwordPlaceholder')"
            @blur="touched.password = true"
          />
          <p
            v-if="touched.password && errors.password"
            class="text-sm text-destructive"
          >
            {{ errors.password }}
          </p>
        </div>
      </CardContent>
      <CardFooter class="mt-8 flex flex-col gap-4">
        <MainButton
          :is-disabled="!isValid"
          :is-loading="loading"
          :is-full-width="true"
          :title="t('auth.login.submit')"
          type="submit"
        />
        <div class="text-center text-sm text-muted-foreground">
          <RouterLink
            :to="{ name: ROUTE_NAMES.FORGOT_PASSWORD }"
            class="underline hover:text-foreground"
          >
            {{ $t('auth.login.forgotPassword') }}
          </RouterLink>
        </div>
        <div class="text-center text-sm text-muted-foreground">
          {{ $t('auth.login.noAccount') }}
          <RouterLink
            :to="{ name: ROUTE_NAMES.REGISTER }"
            class="underline hover:text-foreground"
          >
            {{ $t('auth.login.signUp') }}
          </RouterLink>
        </div>
      </CardFooter>
    </form>
  </Card>
</template>
