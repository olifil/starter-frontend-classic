<script setup lang="ts">
import { ROUTE_NAMES } from '@/router/route-names'

const router = useRouter()

const navigateToHomepage = () => {
  router.push({ name: ROUTE_NAMES.HOMEPAGE })
}
</script>
<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold">404 - Page non trouvée</h1>
    <p>La page que vous cherchez n'existe pas.</p>
    <p class="mt-4">
      <Button @click="navigateToHomepage"> Retour à l'accueil </Button>
    </p>
  </div>
</template>
