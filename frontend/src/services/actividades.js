import api from './api';

export function listarActividades(params = {}) {
  return api.get('/actividades', { params });
}

export function crearActividad(datos) {
  return api.post('/actividades', datos);
}

export function actualizarActividad(id, datos) {
  return api.put(`/actividades/${id}`, datos);
}
