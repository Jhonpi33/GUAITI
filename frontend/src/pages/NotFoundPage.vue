<template>
  <q-page padding class="pagina-listado q-pa-md">
    <div class="text-h5 q-mb-md">Página no encontrada</div>
    <q-card flat bordered class="tarjeta-tabla q-pa-lg text-center">
      <div class="text-h6 text-grey-5">La sección que busca no existe</div>
      <q-btn class="q-mt-md" color="primary" label="Volver al inicio" no-caps unelevated @click="volver" />
    </q-card>
  </q-page>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

function volver() {
  router.push('/inicio');
}
</script>
