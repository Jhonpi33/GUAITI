import api from './api';

export function listarGastos(params = {}) {
  return api.get('/gastos', { params });
}

/**
 * El gasto se envía en JSON; si hay foto de soporte, primero se sube con
 * POST /uploads/foto (services/uploads.js) y aquí se manda la URL.
 */
export function crearGasto(datos) {
  return api.post('/gastos', datos);
}

export function actualizarGasto(id, datos) {
  return api.put(`/gastos/${id}`, datos);
}

export function eliminarGasto(id) {
  return api.delete(`/gastos/${id}`);
}
