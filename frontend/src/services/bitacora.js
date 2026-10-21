import api from './api';

export function listarBitacora(params = {}) {
  return api.get('/bitacora', { params });
}

export function crearBitacora(datos) {
  return api.post('/bitacora', datos);
}

export function actualizarBitacora(id, datos) {
  return api.put(`/bitacora/${id}`, datos);
}
