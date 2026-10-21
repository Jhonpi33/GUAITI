<template>
  <q-layout view="hHh LpR lFf">
    <q-header class="cabecera-app">
      <q-toolbar>
        <q-btn
          v-if="$q.screen.lt.md"
          flat
          dense
          round
          icon="menu"
          aria-label="Abrir menú"
          @click="esquemaAbierto = !esquemaAbierto"
        />
        <q-toolbar-title class="text-weight-medium row items-center no-wrap">
          <img :src="logo" alt="Gua-iti" class="logo-cabecera q-mr-sm" />
          <span class="titulo-cabecera">
            <span class="marca-cabecera">Gua-iti</span><span class="titulo-cabecera-resto">
              Aventura Sin Límites</span
            >
          </span>
        </q-toolbar-title>

        <div class="column items-end no-wrap q-mr-sm gt-sm">
          <span class="text-caption text-grey-3">{{ auth.usuario?.nombre }}</span>
          <span class="text-overline rol-cabecera" style="line-height: 1">{{ auth.nombreRol }}</span>
        </div>

        <q-btn flat dense icon="logout" label="Cerrar sesión" no-caps @click="salir" />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="esquemaAbierto" show-if-above :breakpoint="768" bordered class="fondo-cajon">
      <div class="marca-cajon">
        <img :src="logo" alt="Logo Gua-iti" />
        <div>
          <div class="marca-nombre">Gua-iti</div>
          <div class="marca-lema">Aventura sin límites</div>
        </div>
      </div>

      <q-list padding class="q-mt-sm">
        <q-item
          v-for="item in menuVisible"
          :key="item.to"
          :to="item.to"
          clickable
          v-ripple
          class="rounded-borders q-mx-sm q-mb-xs"
          @click="cerrarCajonMovil"
        >
          <q-item-section avatar>
            <q-icon :name="item.icono" />
          </q-item-section>
          <q-item-section>{{ item.etiqueta }}</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view v-slot="{ Component }">
        <transition name="pagina" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import logo from '../assets/logo.png';

const auth = useAuthStore();
const router = useRouter();

const esquemaAbierto = ref(false);

function cerrarCajonMovil() {
  if (window.innerWidth < 768) esquemaAbierto.value = false;
}

/* Menú del rol de campo: el guía trabaja desde su panel */
const menuGuia = [
  { to: '/panel', etiqueta: 'Panel', icono: 'dashboard' },
  { to: '/salidas', etiqueta: 'Salidas', icono: 'route' },
  { to: '/adelantos', etiqueta: 'Adelantos', icono: 'payments' },
  { to: '/bitacora', etiqueta: 'Bitácora', icono: 'fact_check' },
  { to: '/danos', etiqueta: 'Daños', icono: 'build' },
  { to: '/gastos', etiqueta: 'Gastos', icono: 'receipt_long' },
  { to: '/liquidaciones', etiqueta: 'Liquidaciones', icono: 'request_quote' },
  { to: '/actividades', etiqueta: 'Actividades', icono: 'assignment' },
  { to: '/motos', etiqueta: 'Motos', icono: 'motorcycle' },
];

/* Menú administrativo: lo de siempre más las pantallas de campo */
const menuAdmin = [
  { to: '/inicio', etiqueta: 'Inicio', icono: 'home' },
  { to: '/usuarios', etiqueta: 'Usuarios', icono: 'manage_accounts', soloAdmin: true },
  { to: '/guias', etiqueta: 'Guías', icono: 'groups' },
  { to: '/clientes', etiqueta: 'Clientes', icono: 'badge' },
  { to: '/actividades', etiqueta: 'Actividades', icono: 'assignment' },
  { to: '/motos', etiqueta: 'Motos', icono: 'motorcycle' },
  { to: '/cascos', etiqueta: 'Cascos', icono: 'sports_motorsports', soloAdmin: true },
  { to: '/configuracion', etiqueta: 'Configuración', icono: 'settings' },
  { to: '/salidas', etiqueta: 'Salidas', icono: 'route' },
  { to: '/bitacora', etiqueta: 'Bitácora', icono: 'fact_check' },
  { to: '/danos', etiqueta: 'Daños', icono: 'build' },
  { to: '/gastos', etiqueta: 'Gastos', icono: 'receipt_long' },
  { to: '/adelantos', etiqueta: 'Adelantos', icono: 'payments' },
  { to: '/liquidaciones', etiqueta: 'Liquidaciones', icono: 'request_quote' },
];

const menuVisible = computed(() => {
  const base = auth.esGuia ? menuGuia : menuAdmin;
  return base.filter((item) => !item.soloAdmin || auth.esAdmin);
});

function salir() {
  auth.cerrarSesion();
  router.push({ path: '/login' });
}
</script>
