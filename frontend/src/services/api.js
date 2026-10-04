import axios from 'axios';
import { Notify } from 'quasar';

export const CLAVE_SESION = 'guaiti_auth';

/**
 * Construye el mensaje de error en español a partir de la respuesta del backend.
 * Si el backend envía una lista de errores de validación, se concatena.
 */
export function mensajeDeError(error) {
  const datos = error?.response?.data;
  if (!datos) return 'No fue posible conectar con el servidor';
  if (Array.isArray(datos.errores) && datos.errores.length > 0) {
    return `${datos.message}: ${datos.errores.join(' · ')}`;
  }
  return datos.message || 'No fue posible conectar con el servidor';
}

/**
 * Token guardado en localStorage. Se lee directamente para evitar
 * dependencias circulares con el store de Pinia.
 */
function tokenGuardado() {
  try {
    const crudo = localStorage.getItem(CLAVE_SESION);
    if (!crudo) return null;
    return JSON.parse(crudo)?.token || null;
  } catch {
    return null;
  }
}

/**
 * En desarrollo se usa el proxy de Vite (/api → localhost:4000).
 * En producción (Render) se define VITE_API_URL con la URL completa de la API.
 */
const baseURL = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = tokenGuardado();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    const estado = error.response?.status;
    const url = error.config?.url || '';
    const esLogin = url.includes('/auth/login');

    // Sesión vencida o inválida: se limpia y se regresa al login
    if (estado === 401 && !esLogin) {
      localStorage.removeItem(CLAVE_SESION);
      if (!window.location.pathname.startsWith('/login')) {
        window.location.assign('/login');
      }
    }

    if (error.config?.silenciarNotificacion !== true) {
      Notify.create({ type: 'negative', message: mensajeDeError(error) });
    }

    return Promise.reject(error);
  }
);

export default api;
