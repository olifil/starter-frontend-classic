<script setup lang="ts">
import { useAuthStore } from '../stores/auth.store'
import { useLayoutStore } from '../stores/layout.store'

const route = useRoute()
const { emailVerification } = useAuthStore()
const { pageTitle } = storeToRefs(useLayoutStore())

onMounted(() => {
  pageTitle.value = "Vérification de l'adresse électronique"

  const token = route.query.token

  if (token && typeof token === 'string') {
    emailVerification(token)
  }
})
</script>
<template>
  <Alert class="mt-8" color="info">
    <Spinner />
    <AlertTitle>C'est presque prêt !</AlertTitle>
    <AlertDescription>
      <p>Nous vérifions votre adresse électronique.</p>
      <p>
        Cette page se rechargera automatiquement lorsque l'opération sera
        terminée.
      </p>
    </AlertDescription>
  </Alert>
</template>
