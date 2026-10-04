import { defineStore } from 'pinia';
import api, { CLAVE_SESION } from '../services/api';

function guardarEnLocal(token, usuario) {
  localStorage.setItem(CLAVE_SESION, JSON.stringify({ token, usuario }));
}

function leerLocal() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_SESION) || 'null');
  } catch {
    return null;
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    usuario: null,
    cargandoSesion: false,
  }),

  getters: {
    rol: (estado) => estado.usuario?.rol ?? null,
    esAdmin: (estado) => estado.usuario?.rol === 'admin',
    esSecretario: (estado) => estado.usuario?.rol === 'secretario',
    esGuia: (estado) => estado.usuario?.rol === 'guia',
    tieneSesion: (estado) => Boolean(estado.token && estado.usuario),
    nombreRol: (estado) => {
      const roles = { admin: 'Administrador', secretario: 'Secretaria(o)', guia: 'Guía' };
      return roles[estado.usuario?.rol] || '';
    },
  },

  actions: {
    async iniciarSesion(correo, password) {
      const { data } = await api.post('/auth/login', { correo, password }, { silenciarNotificacion: true });
      this.token = data.data.token;
      this.usuario = data.data.usuario;
      guardarEnLocal(this.token, this.usuario);
      return data.data.usuario;
    },

    cerrarSesion() {
      this.token = null;
      this.usuario = null;
      localStorage.removeItem(CLAVE_SESION);
    },

    /**
     * Restaura la sesión desde localStorage y la valida contra GET /auth/me.
     * Devuelve true si hay una sesión válida.
     */
    async cargarSesion() {
      if (this.tieneSesion) return true;

      const guardado = leerLocal();
      if (!guardado?.token) return false;

      this.cargandoSesion = true;
      this.token = guardado.token;
      this.usuario = guardado.usuario ?? null;

      try {
        const { data } = await api.get('/auth/me', { silenciarNotificacion: true });
        this.usuario = data.data;
        guardarEnLocal(this.token, this.usuario);
        return true;
      } catch {
        this.cerrarSesion();
        return false;
      } finally {
        this.cargandoSesion = false;
      }
    },
  },
});
