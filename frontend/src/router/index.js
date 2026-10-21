import { createRouter, createWebHistory } from 'vue-router';
import { advertencia } from '../services/alertas';
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
import PanelGuiaPage from '../pages/PanelGuiaPage.vue';
import SalidasPage from '../pages/SalidasPage.vue';
import AdelantosPage from '../pages/AdelantosPage.vue';
import BitacoraPage from '../pages/BitacoraPage.vue';
import DanosPage from '../pages/DanosPage.vue';
import GastosPage from '../pages/GastosPage.vue';
import LiquidacionesPage from '../pages/LiquidacionesPage.vue';
import CascosPage from '../pages/CascosPage.vue';
import NotFoundPage from '../pages/NotFoundPage.vue';

/** Destino inicial según el rol: el guía arranca en su panel de campo. */
function inicioPorRol() {
  return useAuthStore().esGuia ? '/panel' : '/inicio';
}

const routes = [
  { path: '/login', name: 'login', component: LoginPage, meta: { publica: true } },
  {
    path: '/',
    component: PanelLayout,
    children: [
      { path: '', redirect: inicioPorRol },
      { path: 'inicio', name: 'inicio', component: InicioPage, meta: { roles: ['admin', 'secretario'] } },
      { path: 'panel', name: 'panel', component: PanelGuiaPage, meta: { roles: ['guia'] } },
      {
        path: 'salidas',
        name: 'salidas',
        component: SalidasPage,
        meta: { roles: ['guia', 'admin', 'secretario'] },
      },
      { path: 'adelantos', name: 'adelantos', component: AdelantosPage, meta: { roles: ['admin', 'secretario', 'guia'] } },
      { path: 'bitacora', name: 'bitacora', component: BitacoraPage, meta: { roles: ['admin', 'secretario', 'guia'] } },
      { path: 'danos', name: 'danos', component: DanosPage, meta: { roles: ['admin', 'secretario', 'guia'] } },
      { path: 'gastos', name: 'gastos', component: GastosPage, meta: { roles: ['admin', 'secretario', 'guia'] } },
      {
        path: 'liquidaciones',
        name: 'liquidaciones',
        component: LiquidacionesPage,
        meta: { roles: ['admin', 'secretario', 'guia'] },
      },
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
      { path: 'cascos', name: 'cascos', component: CascosPage, meta: { roles: ['admin'] } },
      {
        path: 'configuracion',
        name: 'configuracion',
        component: ConfiguracionPage,
        meta: { roles: ['admin', 'secretario'] },
      },
      { path: ':pathMatch(.*)*', name: 'no-encontrado', component: NotFoundPage },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: inicioPorRol },
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
    return auth.tieneSesion ? { path: inicioPorRol() } : true;
  }

  if (!auth.tieneSesion) {
    return { path: '/login', query: { redirigir: to.fullPath } };
  }

  // El guía trabaja desde su panel: el inicio público-administrativo no aplica
  if (auth.esGuia && (to.path === '/' || to.path === '/inicio')) {
    return { path: '/panel' };
  }

  const roles = to.meta.roles;
  if (Array.isArray(roles) && !roles.includes(auth.rol)) {
    advertencia('No tiene permisos para acceder a esta sección');
    return { path: inicioPorRol() };
  }

  return true;
});

export default router;
