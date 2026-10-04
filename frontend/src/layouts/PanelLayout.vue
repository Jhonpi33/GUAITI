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
        <q-toolbar-title class="text-weight-medium">
          <span class="text-primary">Gua-iti</span> Aventura Sin Límites
        </q-toolbar-title>

        <div class="column items-end no-wrap q-mr-sm gt-sm">
          <span class="text-caption text-grey-4">{{ auth.usuario?.nombre }}</span>
          <span class="text-overline text-primary" style="line-height: 1">{{ auth.nombreRol }}</span>
        </div>

        <q-btn flat dense icon="logout" label="Cerrar sesión" no-caps @click="salir" />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="esquemaAbierto" show-if-above :breakpoint="768" bordered class="fondo-cajon">
      <q-list padding class="q-mt-md">
        <q-item
          v-for="item in menuVisible"
          :key="item.to"
          :to="item.to"
          clickable
          v-ripple
          class="rounded-borders q-mx-sm q-mb-xs"
        >
          <q-item-section avatar>
            <q-icon :name="item.icono" />
          </q-item-section>
          <q-item-section>{{ item.etiqueta }}</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const router = useRouter();

const esquemaAbierto = ref(false);

const menu = [
  { to: '/inicio', etiqueta: 'Inicio', icono: 'home', roles: ['admin', 'secretario', 'guia'] },
  { to: '/usuarios', etiqueta: 'Usuarios', icono: 'manage_accounts', roles: ['admin'] },
  { to: '/guias', etiqueta: 'Guías', icono: 'groups', roles: ['admin', 'secretario'] },
  { to: '/clientes', etiqueta: 'Clientes', icono: 'badge', roles: ['admin', 'secretario'] },
  { to: '/actividades', etiqueta: 'Actividades', icono: 'assignment', roles: ['admin', 'secretario', 'guia'] },
  { to: '/motos', etiqueta: 'Motos', icono: 'motorcycle', roles: ['admin', 'secretario', 'guia'] },
  { to: '/configuracion', etiqueta: 'Configuración', icono: 'settings', roles: ['admin', 'secretario'] },
];

const menuVisible = computed(() => menu.filter((item) => item.roles.includes(auth.rol)));

function salir() {
  auth.cerrarSesion();
  router.push({ path: '/login' });
}
</script>
