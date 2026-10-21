import api from './api';

export function listarCascos(params = {}) {
  return api.get('/cascos', { params });
}

export function crearCasco(datos) {
  return api.post('/cascos', datos);
}

export function actualizarCasco(id, datos) {
  return api.put(`/cascos/${id}`, datos);
}

export function eliminarCasco(id) {
  return api.delete(`/cascos/${id}`);
}

/** Crea o recorta cascos numerados de "desde" a "hasta" (solo admin). */
export function definirRangoCascos(desde, hasta) {
  return api.put('/cascos/rango', { desde, hasta });
}
