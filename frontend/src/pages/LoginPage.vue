<template>
  <div class="login-partido">
    <!-- Panel de marca: degradado verde → naranja con patrón geométrico -->
    <aside class="login-marca" ref="panelMarca">
      <img :src="logo" alt="Logo Gua-iti" class="login-marca-logo" />
      <div class="login-marca-nombre">Gua-iti</div>
      <div class="login-marca-lema">Aventura sin límites</div>
      <div class="login-marca-raya"></div>
      <div class="login-marca-lugar">San Gil, Santander</div>
    </aside>

    <!-- Panel derecho: blanco con el formulario -->
    <section class="login-formulario">
      <div class="login-tarjeta" ref="panelFormulario">
        <div class="login-titulo">Iniciar sesión</div>
        <div class="login-subtitulo">Ingresa con tu correo y contraseña</div>

        <q-form class="q-mt-lg" @submit="ingresar">
          <q-input
            v-model="correo"
            class="login-campo"
            outlined
            label="Correo"
            type="email"
            autocomplete="username"
            :dark="false"
            :rules="[reglas.correoObligatorio]"
            lazy-rules
          >
            <template #prepend>
              <q-icon name="mail" />
            </template>
          </q-input>

          <q-input
            v-model="password"
            class="login-campo q-mt-md"
            outlined
            label="Contraseña"
            type="password"
            autocomplete="current-password"
            :dark="false"
            :rules="[reglas.obligatorio]"
            lazy-rules
          >
            <template #prepend>
              <q-icon name="lock" />
            </template>
          </q-input>

          <q-btn
            class="full-width q-mt-lg login-boton-ingresar"
            color="primary"
            type="submit"
            label="Ingresar"
            no-caps
            unelevated
            :loading="cargando"
          />
        </q-form>

        <div class="login-sitio q-mt-lg text-center">Gua-iti · Cuevas y cuatrimotos</div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { mensajeDeError } from '../services/api';
import { error as alertaError } from '../services/alertas';
import { animarEntrada } from '../utils/animaciones';
import { reglas } from '../utils/validaciones';
import logo from '../assets/logo.png';

const auth = useAuthStore();
const route = useRoute();
const router = useRouter();

const correo = ref('');
const password = ref('');
const cargando = ref(false);
const panelMarca = ref(null);
const panelFormulario = ref(null);

async function ingresar() {
  cargando.value = true;
  try {
    await auth.iniciarSesion(correo.value.trim(), password.value);
    const destino = route.query.redirigir || (auth.esGuia ? '/panel' : '/inicio');
    router.push(destino);
  } catch (e) {
    await alertaError(mensajeDeError(e));
  } finally {
    cargando.value = false;
  }
}

onMounted(() => {
  animarEntrada(panelMarca.value);
  animarEntrada(panelFormulario.value);
});
</script>
