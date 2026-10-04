import { createRouter, createWebHistory } from 'vue-router';
import { Notify } from 'quasar';
import { useAuthStore } from '../stores/auth';

import PanelLayout from '../layouts/PanelLayout.vue';
import LoginPage from '../pages/LoginPage.vue';
import InicioPage from '../pages/InicioPage.vue';
import GuiasPage from '../pages/GuiasPage.vue';
import ClientesPage from '../pages/ClientesPage.vue';
import ActividadesPage from '../pages/ActividadesPage.vue';
import MotosPage from '../pages/MotosPage.vue';
import ConfiguracionPage from '../pages/ConfiguracionPage.vue';
import UsuariosPage from '../pages/UsuariosPage.vue';
import NotFoundPage from '../pages/NotFoundPage.vue';

const routes = [
  { path: '/login', name: 'login', component: LoginPage, meta: { publica: true } },
  {
    path: '/',
    component: PanelLayout,
    children: [
      { path: '', redirect: '/inicio' },
      { path: 'inicio', name: 'inicio', component: InicioPage },
      { path: 'usuarios', name: 'usuarios', component: UsuariosPage, meta: { roles: ['admin'] } },
      { path: 'guias', name: 'guias', component: GuiasPage, meta: { roles: ['admin', 'secretario'] } },
      { path: 'clientes', name: 'clientes', component: ClientesPage, meta: { roles: ['admin', 'secretario'] } },
      {
        path: 'actividades',
        name: 'actividades',
        component: ActividadesPage,
        meta: { roles: ['admin', 'secretario', 'guia'] },
      },
      { path: 'motos', name: 'motos', component: MotosPage, meta: { roles: ['admin', 'secretario', 'guia'] } },
      {
        path: 'configuracion',
        name: 'configuracion',
        component: ConfiguracionPage,
        meta: { roles: ['admin', 'secretario'] },
      },
      { path: ':pathMatch(.*)*', name: 'no-encontrado', component: NotFoundPage },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/inicio' },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

let sesionInicial = null;

router.beforeEach(async (to) => {
  const auth = useAuthStore();

  // En la primera carga se restaura y valida la sesión antes de decidir
  if (!sesionInicial) sesionInicial = auth.cargarSesion();
  await sesionInicial;

  if (to.meta.publica === true) {
    return auth.tieneSesion ? { path: '/inicio' } : true;
  }

  if (!auth.tieneSesion) {
    return { path: '/login', query: { redirigir: to.fullPath } };
  }

  const roles = to.meta.roles;
  if (Array.isArray(roles) && !roles.includes(auth.rol)) {
    Notify.create({ type: 'warning', message: 'No tiene permisos para acceder a esta sección' });
    return { path: '/inicio' };
  }

  return true;
});

export default router;
