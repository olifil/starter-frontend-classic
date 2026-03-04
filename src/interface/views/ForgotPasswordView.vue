<script setup lang="ts">
import { useAuthStore } from '../stores/auth.store'
import { useLayoutStore } from '../stores/layout.store'
import { ROUTE_NAMES } from '@/router/route-names'
import MainButton from '../components/MainButton.vue'

const { t } = useI18n()
const { forgotPassword } = useAuthStore()
const { pageTitle, pageDescription } = storeToRefs(useLayoutStore())
const router = useRouter()

const loading = toRef(useAuthStore(), 'loading')
const email = ref('')
const emailTouched = ref(false)

const emailError = computed(() =>
  !email.value.trim()
    ? t('validation.emailRequired')
    : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())
      ? t('validation.emailInvalid')
      : '',
)

async function onSubmit() {
  if (emailError.value) return
  await forgotPassword({ email: email.value })
  router.push({ name: ROUTE_NAMES.LOGIN })
}

onMounted(() => {
  pageTitle.value = t('auth.forgotPassword.title')
  pageDescription.value = t('auth.forgotPassword.description')
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
            @blur="emailTouched = true"
          />
          <p v-if="emailTouched && emailError" class="text-sm text-destructive">
            {{ emailError }}
          </p>
        </div>
      </CardContent>
      <CardFooter class="mt-8 flex flex-col gap-4">
        <MainButton
          :is-disabled="!!emailError"
          :is-loading="loading"
          :is-full-width="true"
          :title="t('auth.forgotPassword.submit')"
          type="submit"
        />
        <div class="text-center text-sm text-muted-foreground">
          <RouterLink
            :to="{ name: ROUTE_NAMES.LOGIN }"
            class="underline hover:text-foreground"
          >
            {{ $t('auth.forgotPassword.backToLogin') }}
          </RouterLink>
        </div>
      </CardFooter>
    </form>
  </Card>
</template>
