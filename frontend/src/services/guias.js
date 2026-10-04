import api from './api';

export function listarGuias(params = {}) {
  return api.get('/guias', { params });
}

export function crearGuia(datos) {
  return api.post('/guias', datos);
}

export function actualizarGuia(id, datos) {
  return api.put(`/guias/${id}`, datos);
}

/** El backend no borra guías: los desactiva. */
export function desactivarGuia(id) {
  return api.delete(`/guias/${id}`);
}
