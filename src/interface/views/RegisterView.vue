<script setup lang="ts">
import PasswordInput from '@/interface/components/PasswordInput.vue'
import { useAuthStore } from '../stores/auth.store'
import { CheckCircle2Icon } from 'lucide-vue-next'
import MainButton from '../components/MainButton.vue'
import { ROUTE_NAMES } from '@/router/route-names'
import { useLayoutStore } from '../stores/layout.store'

const { t } = useI18n()
const authStore = useAuthStore()
const { register } = authStore
const loading = toRef(authStore, 'loading')
const { pageTitle, pageDescription } = storeToRefs(useLayoutStore())

onMounted(() => {
  pageTitle.value = t('auth.register.title')
  pageDescription.value = t('auth.register.description')
})

const registrationCompleted = ref(false)

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const termsAccepted = ref(false)

const touched = reactive({
  firstName: false,
  lastName: false,
  email: false,
  password: false,
  passwordConfirmation: false,
  termsAccepted: false,
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
  firstName: !firstName.value.trim() ? t('validation.firstNameRequired') : '',
  lastName: !lastName.value.trim() ? t('validation.lastNameRequired') : '',
  email: !email.value.trim()
    ? t('validation.emailRequired')
    : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())
      ? t('validation.emailInvalid')
      : '',
  password: getPasswordErrors(password.value),
  passwordConfirmation: !passwordConfirmation.value
    ? t('validation.confirmRequired')
    : passwordConfirmation.value !== password.value
      ? t('validation.passwordMismatch')
      : '',
  termsAccepted: !termsAccepted.value
    ? t('validation.termsAcceptedRequired')
    : '',
}))

const isValid = computed(
  () =>
    !errors.value.firstName &&
    !errors.value.lastName &&
    !errors.value.email &&
    errors.value.password.length === 0 &&
    !errors.value.passwordConfirmation &&
    !errors.value.termsAccepted,
)

async function onSubmit() {
  if (!isValid.value) return
  await register({
    email: email.value,
    password: password.value,
    firstName: firstName.value,
    lastName: lastName.value,
    termsAccepted: termsAccepted.value,
  })
  registrationCompleted.value = true
}
</script>

<template>
  <Card class="w-full max-w-md">
    <form v-if="!registrationCompleted" @submit.prevent="onSubmit">
      <CardContent class="space-y-4">
        <div class="space-y-2">
          <Label for="first-name">{{ $t('auth.register.firstName') }}</Label>
          <Input
            id="first-name"
            v-model="firstName"
            type="text"
            :placeholder="$t('auth.register.firstNamePlaceholder')"
            @blur="touched.firstName = true"
          />
          <p
            v-if="touched.firstName && errors.firstName"
            class="text-sm text-destructive"
          >
            {{ errors.firstName }}
          </p>
        </div>
        <div class="space-y-2">
          <Label for="last-name">{{ $t('auth.register.lastName') }}</Label>
          <Input
            id="last-name"
            v-model="lastName"
            type="text"
            :placeholder="$t('auth.register.lastNamePlaceholder')"
            @blur="touched.lastName = true"
          />
          <p
            v-if="touched.lastName && errors.lastName"
            class="text-sm text-destructive"
          >
            {{ errors.lastName }}
          </p>
        </div>
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
            class="text-sm text-destructive"
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
        <div class="space-y-2">
          <div class="flex items-start gap-3">
            <Checkbox
              id="terms-accepted"
              v-model="termsAccepted"
              @update:model-value="touched.termsAccepted = true"
            />
            <Label
              for="terms-accepted"
              class="cursor-pointer font-normal leading-snug"
            >
              {{ $t('auth.register.termsAcceptedPrefix') }}
              <RouterLink
                :to="{ name: ROUTE_NAMES.CGU }"
                class="underline hover:text-foreground"
                target="_blank"
                >{{ $t('auth.register.termsAcceptedLink') }}</RouterLink
              >
            </Label>
          </div>
          <p
            v-if="touched.termsAccepted && errors.termsAccepted"
            class="text-sm text-destructive"
          >
            {{ errors.termsAccepted }}
          </p>
        </div>
      </CardContent>
      <CardFooter class="mt-8 flex flex-col gap-4">
        <MainButton
          :is-disabled="!isValid"
          :is-loading="loading"
          :is-full-width="true"
          :title="t('auth.register.submit')"
          type="submit"
        />
        <div class="text-center text-sm text-muted-foreground">
          {{ $t('auth.register.hasAccount') }}
          <RouterLink
            :to="{ name: ROUTE_NAMES.LOGIN }"
            class="underline hover:text-foreground"
          >
            {{ $t('auth.register.signIn') }}
          </RouterLink>
        </div>
      </CardFooter>
    </form>
    <CardContent v-else>
      <Alert color="success">
        <CheckCircle2Icon />
        <AlertTitle>Votre inscription est presque terminée</AlertTitle>
        <AlertDescription>
          <p>Nous venons de vous envoyer un e-mail.</p>
          <p>
            Consultez-le et vérifiez votre e-mail afin de pouvoir vous
            authentifier.
          </p>
        </AlertDescription>
      </Alert>
    </CardContent>
  </Card>
</template>
