<script setup lang="ts">
import PasswordInput from '@/interface/components/PasswordInput.vue'
import MainButton from '@/interface/components/MainButton.vue'
import { useAuthStore } from '../stores/auth.store'
import { ROUTE_NAMES } from '@/router/route-names'
import { useLayoutStore } from '../stores/layout.store'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const loading = toRef(authStore, 'loading')
const { pageTitle, pageDescription } = storeToRefs(useLayoutStore())

const token = route.query.token
if (!token || typeof token !== 'string') {
  router.replace({ name: ROUTE_NAMES.FORGOT_PASSWORD })
}

const password = ref('')
const passwordConfirmation = ref('')

const touched = reactive({
  password: false,
  passwordConfirmation: false,
})

function getPasswordErrors(value: string): string[] {
  if (!value) return [t('validation.passwordRequired')]
  const errs: string[] = []
  if (value.length < 8 || value.length > 128)
    errs.push(t('validation.passwordLength'))
  if (!/[a-z]/.test(value)) errs.push(t('validation.passwordLowercase'))
  if (!/[A-Z]/.test(value)) errs.push(t('validation.passwordUppercase'))
  if (!/\d/.test(value)) errs.push(t('validation.passwordDigit'))
  if (!/[@$!%*?&]/.test(value)) errs.push(t('validation.passwordSpecial'))
  if (!/^[A-Za-z\d@$!%*?&]+$/.test(value))
    errs.push(t('validation.passwordInvalidChars'))
  return errs
}

const errors = computed(() => ({
  password: getPasswordErrors(password.value),
  passwordConfirmation: !passwordConfirmation.value
    ? t('validation.confirmRequired')
    : passwordConfirmation.value !== password.value
      ? t('validation.passwordMismatch')
      : '',
}))

const isValid = computed(
  () =>
    errors.value.password.length === 0 && !errors.value.passwordConfirmation,
)

async function onSubmit() {
  if (!isValid.value || typeof token !== 'string') return
  await authStore.resetPassword({ token, newPassword: password.value })
}

onMounted(() => {
  pageTitle.value = t('auth.reset-password.title')
  pageDescription.value = t('auth.reset-password.description')
})
</script>

<template>
  <Card class="w-full max-w-md">
    <form @submit.prevent="onSubmit">
      <CardContent class="space-y-4">
        <div class="space-y-2">
          <Label for="password">{{ $t('field.password') }}</Label>
          <PasswordInput
            id="password"
            v-model="password"
            :placeholder="$t('field.passwordPlaceholder')"
            @blur="touched.password = true"
          />
          <ul
            v-if="touched.password && errors.password.length"
            class="space-y-1"
          >
            <li
              v-for="err in errors.password"
              :key="err"
              class="text-sm text-destructive"
            >
              {{ err }}
            </li>
          </ul>
        </div>
        <div class="space-y-2">
          <Label for="password-confirmation">{{
            $t('auth.register.confirmPassword')
          }}</Label>
          <PasswordInput
            id="password-confirmation"
            v-model="passwordConfirmation"
            :placeholder="$t('field.passwordPlaceholder')"
            @blur="touched.passwordConfirmation = true"
          />
          <p
            v-if="touched.passwordConfirmation && errors.passwordConfirmation"
            class="text-sm text-destructive"
          >
            {{ errors.passwordConfirmation }}
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <MainButton
          class="mt-8"
          :is-disabled="!isValid"
          :is-loading="loading"
          :title="t('auth.reset-password.submit')"
          type="submit"
        />
      </CardFooter>
    </form>
  </Card>
</template>
