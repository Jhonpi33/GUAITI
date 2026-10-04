<template>
  <div class="login-fondo column items-center justify-center q-pa-md">
    <q-card class="login-tarjeta q-pa-sm">
      <q-card-section class="column items-center q-pt-lg q-pb-sm">
        <img :src="logo" alt="Logo Gua-iti" class="login-logo" />
        <div class="login-titulo text-h5 q-mt-lg text-center">Gua-iti Aventura Sin Límites</div>
        <div class="text-overline text-secondary q-mt-xs">San Gil, Santander</div>
      </q-card-section>

      <q-card-section>
        <q-banner v-if="error" class="bg-negative text-white q-mb-md" dense rounded>
          {{ error }}
        </q-banner>

        <q-form class="q-gutter-md" @submit="ingresar">
          <q-input
            v-model="correo"
            outlined
            dense
            label="Correo"
            type="email"
            autocomplete="username"
            :rules="[reglas.correoObligatorio]"
            lazy-rules
          >
            <template #prepend>
              <q-icon name="mail" />
            </template>
          </q-input>

          <q-input
            v-model="password"
            outlined
            dense
            label="Contraseña"
            type="password"
            autocomplete="current-password"
            :rules="[reglas.obligatorio]"
            lazy-rules
          >
            <template #prepend>
              <q-icon name="lock" />
            </template>
          </q-input>

          <q-btn
            type="submit"
            color="primary"
            label="Ingresar"
            class="full-width"
            no-caps
            unelevated
            :loading="cargando"
          />
        </q-form>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { mensajeDeError } from '../services/api';
import { reglas } from '../utils/validaciones';
import logo from '../assets/logo.png';

const auth = useAuthStore();
const route = useRoute();
const router = useRouter();

const correo = ref('');
const password = ref('');
const cargando = ref(false);
const error = ref('');

async function ingresar() {
  error.value = '';
  cargando.value = true;
  try {
    await auth.iniciarSesion(correo.value.trim(), password.value);
    const destino = route.query.redirigir || '/inicio';
    router.push(destino);
  } catch (e) {
    error.value = mensajeDeError(e);
  } finally {
    cargando.value = false;
  }
}
</script>
