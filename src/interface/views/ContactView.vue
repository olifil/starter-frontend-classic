<script setup lang="ts">
import { ContactHttpAdapter } from '@/infrastructure/adapters/http/contact.http-adapter'
import MainButton from '../components/MainButton.vue'
import { Toast } from '../composables/toast'
import { ROUTE_NAMES } from '@/router/route-names'
import { useLayoutStore } from '../stores/layout.store'

const { t } = useI18n()
const repository = new ContactHttpAdapter()
const router = useRouter()
const toast = new Toast()
const { pageTitle, pageDescription } = storeToRefs(useLayoutStore())

const loading = ref(false)

const senderName = ref('')
const email = ref('')
const subject = ref('')
const body = ref('')

const touched = reactive({
  senderName: false,
  email: false,
  subject: false,
  body: false,
})

const errors = computed(() => ({
  senderName: !senderName.value.trim()
    ? t('validation.senderNameRequired')
    : '',
  email: !email.value.trim()
    ? t('validation.emailRequired')
    : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())
      ? t('validation.emailInvalid')
      : '',
  subject: !subject.value.trim() ? t('validation.subjectRequired') : '',
  body: !body.value.trim() ? t('validation.bodyRequired') : '',
}))

const isValid = computed(
  () =>
    !errors.value.senderName &&
    !errors.value.email &&
    !errors.value.subject &&
    !errors.value.body,
)

onMounted(() => {
  pageTitle.value = t('contact.title')
  pageDescription.value = t('contact.description')
})

async function onSubmit() {
  if (!isValid.value) return
  loading.value = true
  try {
    await repository.contact({
      senderName: senderName.value,
      senderEmail: email.value,
      subject: subject.value,
      body: body.value,
    })
    toast.success('Confirmation', 'Votre message a bien été envoyé.')
    router.push({ name: ROUTE_NAMES.HOMEPAGE })
  } finally {
    loading.value = false
  }
}
</script>
<template>
  <Card class="w-full max-w-md">
    <form @submit.prevent="onSubmit">
      <CardContent class="space-y-4">
        <div class="space-y-2">
          <Label for="senderName">{{ $t('contact.senderName') }}</Label>
          <Input
            id="senderName"
            v-model="senderName"
            type="text"
            :placeholder="$t('contact.senderNamePlaceholder')"
            @blur="touched.senderName = true"
          />
          <p
            v-if="touched.senderName && errors.senderName"
            class="text-sm text-destructive"
          >
            {{ errors.senderName }}
          </p>
        </div>
        <div class="space-y-2">
          <Label for="email">{{ $t('contact.email') }}</Label>
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
          <Label for="subject">{{ $t('contact.subject') }}</Label>
          <Input
            id="subject"
            v-model="subject"
            type="text"
            :placeholder="$t('contact.subjectPlaceholder')"
            @blur="touched.subject = true"
          />
          <p
            v-if="touched.subject && errors.subject"
            class="text-sm text-destructive"
          >
            {{ errors.subject }}
          </p>
        </div>
        <div class="space-y-2">
          <Label for="body">{{ $t('contact.body') }}</Label>
          <textarea
            id="body"
            v-model="body"
            rows="4"
            class="w-full px-3 py-2 border rounded-md"
            :placeholder="$t('contact.bodyPlaceholder')"
            @blur="touched.body = true"
          />
          <p
            v-if="touched.body && errors.body"
            class="text-sm text-destructive"
          >
            {{ errors.body }}
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <MainButton
          class="mt-8"
          :is-disabled="!isValid"
          :is-loading="loading"
          :title="t('contact.send')"
          type="submit"
        />
      </CardFooter>
    </form>
  </Card>
</template>
