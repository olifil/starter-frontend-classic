<script setup lang="ts">
import MainButton from '../components/MainButton.vue'
import PasswordInput from '../components/PasswordInput.vue'
import { useUserStore } from '../stores/user.store'
import { useLayoutStore } from '../stores/layout.store'
import { useNotificationStore } from '../stores/notification.store'

const { t, locale } = useI18n()
const userStore = useUserStore()
const { me } = storeToRefs(userStore)
const { getMe, updateMe, deleteMe } = userStore
const { pageTitle, pageDescription } = storeToRefs(useLayoutStore())

const notificationStore = useNotificationStore()
const { preferences, availableChannels } = storeToRefs(notificationStore)
const { getPreferences, updatePreferences, getAvailableChannels, subscribePush } = notificationStore

const isPreferencesSaving = ref(false)
const isPreferencesDirty = ref(false)
const webPushError = ref<string | null>(null)

async function handlePreferenceToggle(
  pref: { channel: string; enabled: boolean },
  value: boolean,
) {
  isPreferencesDirty.value = true
  if (pref.channel === 'WEB_PUSH') {
    webPushError.value = null
    if (value) {
      try {
        await subscribePush()
      } catch (e: unknown) {
        pref.enabled = false
        isPreferencesDirty.value = false
        const msg = e instanceof Error ? e.message : ''
        webPushError.value =
          msg === 'web_push_permission_denied'
            ? t('profile.notifications.webPushPermissionDenied')
            : msg === 'web_push_not_supported'
              ? t('profile.notifications.webPushNotSupported')
              : t('errors.generic')
      }
    }
  }
}

async function savePreferencesHandler() {
  isPreferencesSaving.value = true
  await updatePreferences({
    preferences: preferences.value.map((p) => ({ channel: p.channel, enabled: p.enabled })),
  })
  isPreferencesDirty.value = false
  isPreferencesSaving.value = false
}

// Edit info dialog
const isEditDialogOpen = ref(false)
const isEditLoading = ref(false)
const editForm = reactive({ firstName: '', lastName: '', phoneNumber: '' })

const phoneNumberError = computed(() => {
  if (!editForm.phoneNumber) return ''
  return /^\+[1-9]\d{7,14}$/.test(editForm.phoneNumber)
    ? ''
    : t('validation.phoneNumberInvalid')
})

// Change password dialog
const isPasswordDialogOpen = ref(false)
const isPasswordLoading = ref(false)
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: '',
})
const passwordTouched = reactive({
  currentPassword: false,
  newPassword: false,
  confirmNewPassword: false,
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

const passwordErrors = computed(() => ({
  currentPassword: !passwordForm.currentPassword
    ? t('validation.passwordRequired')
    : '',
  newPassword: getPasswordErrors(passwordForm.newPassword),
  confirmNewPassword: !passwordForm.confirmNewPassword
    ? t('validation.confirmRequired')
    : passwordForm.confirmNewPassword !== passwordForm.newPassword
      ? t('validation.passwordMismatch')
      : '',
}))

const isPasswordFormValid = computed(
  () =>
    !passwordErrors.value.currentPassword &&
    passwordErrors.value.newPassword.length === 0 &&
    !passwordErrors.value.confirmNewPassword,
)

// Change email dialog
const isEmailDialogOpen = ref(false)
const isEmailLoading = ref(false)
const emailSent = ref(false)
const emailForm = reactive({ newEmail: '', currentPassword: '' })
const emailTouched = reactive({ newEmail: false, currentPassword: false })

const emailErrors = computed(() => ({
  newEmail: !emailForm.newEmail
    ? t('validation.emailRequired')
    : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailForm.newEmail)
      ? t('validation.emailInvalid')
      : '',
  currentPassword: !emailForm.currentPassword
    ? t('validation.passwordRequired')
    : '',
}))

const isEmailFormValid = computed(
  () => !emailErrors.value.newEmail && !emailErrors.value.currentPassword,
)

const openEmailDialog = () => {
  emailForm.newEmail = ''
  emailForm.currentPassword = ''
  emailTouched.newEmail = false
  emailTouched.currentPassword = false
  emailSent.value = false
  isEmailDialogOpen.value = true
}

const saveEmailHandler = async () => {
  if (!isEmailFormValid.value) return
  isEmailLoading.value = true
  await updateMe({
    newEmail: emailForm.newEmail,
    currentPassword: emailForm.currentPassword,
  })
  isEmailLoading.value = false
  emailSent.value = true
}

// Delete dialog
const isDeleteDialogOpen = ref(false)

const memberSince = computed(() => {
  if (!me.value?.createdAt) return ''
  return new Intl.DateTimeFormat(locale.value, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(me.value.createdAt))
})

const openEditDialog = () => {
  editForm.firstName = me.value?.firstName ?? ''
  editForm.lastName = me.value?.lastName ?? ''
  editForm.phoneNumber = me.value?.phoneNumber ?? ''
  isEditDialogOpen.value = true
}

const saveHandler = async () => {
  if (phoneNumberError.value) return
  isEditLoading.value = true
  await updateMe({
    firstName: editForm.firstName,
    lastName: editForm.lastName,
    phoneNumber: editForm.phoneNumber || null,
  })
  pageTitle.value = me.value
    ? `${me.value.firstName} ${me.value.lastName}`
    : t('profile.title')
  isEditLoading.value = false
  isEditDialogOpen.value = false
}

const openPasswordDialog = () => {
  passwordForm.currentPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmNewPassword = ''
  passwordTouched.currentPassword = false
  passwordTouched.newPassword = false
  passwordTouched.confirmNewPassword = false
  isPasswordDialogOpen.value = true
}

const savePasswordHandler = async () => {
  if (!isPasswordFormValid.value) return
  isPasswordLoading.value = true
  await updateMe({
    currentPassword: passwordForm.currentPassword,
    newPassword: passwordForm.newPassword,
  })
  isPasswordLoading.value = false
  isPasswordDialogOpen.value = false
}

const deleteHandler = () => {
  isDeleteDialogOpen.value = true
}

const confirmHandler = async () => {
  await deleteMe()
}

onMounted(async () => {
  if (!me.value) {
    await getMe()
  }
  pageTitle.value = me.value
    ? `${me.value.firstName} ${me.value.lastName}`
    : t('profile.title')
  pageDescription.value = t('profile.description')
  await Promise.all([getPreferences(), getAvailableChannels()])
})
</script>
<template>
  <Card class="mt-8">
    <CardHeader>
      <CardTitle class="text-2xl">{{ $t('profile.info.title') }}</CardTitle>
    </CardHeader>
    <CardContent>
      <dl class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <dt class="text-sm text-muted-foreground">
            {{ $t('auth.register.firstName') }}
          </dt>
          <dd class="mt-1 font-medium">{{ me?.firstName }}</dd>
        </div>
        <div>
          <dt class="text-sm text-muted-foreground">
            {{ $t('auth.register.lastName') }}
          </dt>
          <dd class="mt-1 font-medium">{{ me?.lastName }}</dd>
        </div>
        <div>
          <dt class="text-sm text-muted-foreground">{{ $t('field.email') }}</dt>
          <dd class="mt-1 font-medium">{{ me?.email }}</dd>
        </div>
        <div>
          <dt class="text-sm text-muted-foreground">
            {{ $t('field.phoneNumber') }}
          </dt>
          <dd class="mt-1 font-medium text-muted-foreground italic" v-if="!me?.phoneNumber">—</dd>
          <dd class="mt-1 font-medium" v-else>{{ me.phoneNumber }}</dd>
        </div>
        <div>
          <dt class="text-sm text-muted-foreground">
            {{ $t('profile.info.memberSince') }}
          </dt>
          <dd class="mt-1 font-medium">{{ memberSince }}</dd>
        </div>
      </dl>
    </CardContent>
    <CardFooter class="flex justify-end">
      <Button @click="openEditDialog">
        {{ $t('profile.info.editTitle') }}
      </Button>
    </CardFooter>
  </Card>
  <Card class="mt-8">
    <CardHeader>
      <CardTitle class="text-2xl">{{ $t('profile.email.title') }}</CardTitle>
      <CardDescription>{{ $t('profile.email.description') }}</CardDescription>
    </CardHeader>
    <CardFooter class="flex justify-end">
      <Button @click="openEmailDialog">
        {{ $t('profile.email.title') }}
      </Button>
    </CardFooter>
  </Card>
  <Card class="mt-8">
    <CardHeader class="mb-4">
      <CardTitle class="text-2xl">{{
        $t('profile.notifications.title')
      }}</CardTitle>
      <CardDescription>{{
        $t('profile.notifications.description')
      }}</CardDescription>
    </CardHeader>
    <CardContent>
      <ul class="space-y-4">
        <li
          v-for="pref in preferences"
          :key="pref.channel"
          class="flex items-center justify-between"
          :class="{ 'opacity-50': !availableChannels.includes(pref.channel) }"
        >
          <span class="text-sm font-medium">
            {{ $t(`profile.notifications.channels.${pref.channel}`) }}
          </span>
          <Switch
            v-model="pref.enabled"
            :disabled="!availableChannels.includes(pref.channel)"
            @update:model-value="handlePreferenceToggle(pref, $event)"
          />
        </li>
      </ul>
      <p
        v-if="preferences.length === 0"
        class="text-sm text-muted-foreground"
      >
        {{ $t('profile.notifications.empty') }}
      </p>
      <Alert v-if="webPushError" color="error" class="mt-4">
        <AlertDescription>{{ webPushError }}</AlertDescription>
      </Alert>
    </CardContent>
    <CardFooter class="flex justify-end mt-6">
      <MainButton
        :isLoading="isPreferencesSaving"
        :isDisabled="preferences.length === 0 || !isPreferencesDirty"
        :title="$t('profile.notifications.save')"
        type="button"
        @click="savePreferencesHandler"
      />
    </CardFooter>
  </Card>
  <Card class="mt-8" color="error">
    <CardHeader>
      <CardTitle class="text-2xl">{{ $t('profile.password.title') }}</CardTitle>
      <CardDescription>{{
        $t('profile.password.description')
      }}</CardDescription>
    </CardHeader>
    <CardFooter class="flex justify-end">
      <MainButton
        color="error"
        :title="$t('profile.password.title')"
        @click="openPasswordDialog"
      />
    </CardFooter>
  </Card>
  <Card class="mt-8" color="error">
    <CardHeader>
      <CardTitle class="text-2xl">{{
        $t('profile.deleteAccount.title')
      }}</CardTitle>
      <CardDescription>{{
        $t('profile.deleteAccount.description')
      }}</CardDescription>
    </CardHeader>
    <CardFooter class="mt-8 flex justify-end">
      <div class="space-y-2">
        <MainButton
          class="text-white px-4 py-2 rounded transition-colors"
          :title="t('common.delete')"
          type="button"
          color="error"
          @click="deleteHandler"
        />
      </div>
    </CardFooter>
  </Card>

  <Dialog v-model:open="isEditDialogOpen">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ $t('profile.info.editTitle') }}</DialogTitle>
      </DialogHeader>
      <div class="space-y-4 py-2">
        <div class="space-y-2">
          <Label for="edit-firstName">{{
            $t('auth.register.firstName')
          }}</Label>
          <Input id="edit-firstName" v-model="editForm.firstName" />
        </div>
        <div class="space-y-2">
          <Label for="edit-lastName">{{ $t('auth.register.lastName') }}</Label>
          <Input id="edit-lastName" v-model="editForm.lastName" />
        </div>
        <div class="space-y-2">
          <Label for="edit-phoneNumber">{{ $t('field.phoneNumber') }}</Label>
          <Input
            id="edit-phoneNumber"
            v-model="editForm.phoneNumber"
            type="tel"
            :placeholder="$t('field.phoneNumberPlaceholder')"
          />
          <p v-if="phoneNumberError" class="text-sm text-destructive">
            {{ phoneNumberError }}
          </p>
        </div>
      </div>
      <DialogFooter>
        <DialogClose as-child>
          <Button variant="outline">{{ t('common.cancel') }}</Button>
        </DialogClose>
        <MainButton
          :isLoading="isEditLoading"
          :title="t('common.save')"
          type="button"
          @click="saveHandler"
        />
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <Dialog v-model:open="isEmailDialogOpen">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ $t('profile.email.title') }}</DialogTitle>
      </DialogHeader>
      <template v-if="emailSent">
        <Alert color="success" class="mt-2">
          <AlertTitle>{{ $t('profile.email.successTitle') }}</AlertTitle>
          <AlertDescription>
            {{
              $t('profile.email.successDescription', {
                email: emailForm.newEmail,
              })
            }}
          </AlertDescription>
        </Alert>
        <DialogFooter class="mt-4">
          <DialogClose as-child>
            <Button variant="outline">{{ t('common.cancel') }}</Button>
          </DialogClose>
        </DialogFooter>
      </template>
      <template v-else>
        <div class="space-y-4 py-2">
          <div class="space-y-2">
            <Label for="new-email">{{ $t('profile.email.newEmail') }}</Label>
            <Input
              id="new-email"
              v-model="emailForm.newEmail"
              type="email"
              @blur="emailTouched.newEmail = true"
            />
            <p
              v-if="emailTouched.newEmail && emailErrors.newEmail"
              class="text-sm text-destructive"
            >
              {{ emailErrors.newEmail }}
            </p>
          </div>
          <div class="space-y-2">
            <Label for="email-current-password">{{
              $t('profile.email.currentPassword')
            }}</Label>
            <PasswordInput
              id="email-current-password"
              v-model="emailForm.currentPassword"
              @blur="emailTouched.currentPassword = true"
            />
            <p
              v-if="emailTouched.currentPassword && emailErrors.currentPassword"
              class="text-sm text-destructive"
            >
              {{ emailErrors.currentPassword }}
            </p>
          </div>
        </div>
        <DialogFooter>
          <DialogClose as-child>
            <Button variant="outline">{{ t('common.cancel') }}</Button>
          </DialogClose>
          <MainButton
            :isLoading="isEmailLoading"
            :isDisabled="!isEmailFormValid"
            :title="t('common.save')"
            type="button"
            @click="saveEmailHandler"
          />
        </DialogFooter>
      </template>
    </DialogContent>
  </Dialog>

  <Dialog v-model:open="isPasswordDialogOpen">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ $t('profile.password.title') }}</DialogTitle>
      </DialogHeader>
      <div class="space-y-4 py-2">
        <div class="space-y-2">
          <Label for="current-password">{{
            $t('profile.password.currentPassword')
          }}</Label>
          <PasswordInput
            id="current-password"
            v-model="passwordForm.currentPassword"
            @blur="passwordTouched.currentPassword = true"
          />
          <p
            v-if="
              passwordTouched.currentPassword && passwordErrors.currentPassword
            "
            class="text-sm text-destructive"
          >
            {{ passwordErrors.currentPassword }}
          </p>
        </div>
        <div class="space-y-2">
          <Label for="new-password">{{
            $t('profile.password.newPassword')
          }}</Label>
          <PasswordInput
            id="new-password"
            v-model="passwordForm.newPassword"
            @blur="passwordTouched.newPassword = true"
          />
          <ul
            v-if="
              passwordTouched.newPassword && passwordErrors.newPassword.length
            "
            class="space-y-1"
          >
            <li
              v-for="err in passwordErrors.newPassword"
              :key="err"
              class="text-sm text-destructive"
            >
              {{ err }}
            </li>
          </ul>
        </div>
        <div class="space-y-2">
          <Label for="confirm-new-password">{{
            $t('profile.password.confirmNewPassword')
          }}</Label>
          <PasswordInput
            id="confirm-new-password"
            v-model="passwordForm.confirmNewPassword"
            @blur="passwordTouched.confirmNewPassword = true"
          />
          <p
            v-if="
              passwordTouched.confirmNewPassword &&
              passwordErrors.confirmNewPassword
            "
            class="text-sm text-destructive"
          >
            {{ passwordErrors.confirmNewPassword }}
          </p>
        </div>
      </div>
      <DialogFooter>
        <DialogClose as-child>
          <Button variant="outline">{{ t('common.cancel') }}</Button>
        </DialogClose>
        <MainButton
          :isLoading="isPasswordLoading"
          :isDisabled="!isPasswordFormValid"
          :title="t('common.save')"
          type="button"
          @click="savePasswordHandler"
        />
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <AppAlertDialog
    v-model:isOpen="isDeleteDialogOpen"
    :title="$t('profile.deleteAccount.title')"
    :description="$t('profile.deleteAccount.description')"
    :confirm-button-text="$t('common.confirm')"
    @confirm="confirmHandler"
  />
</template>
