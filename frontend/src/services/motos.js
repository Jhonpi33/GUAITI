import api from './api';

export function listarMotos(params = {}) {
  return api.get('/motos', { params });
}

export function crearMoto(datos) {
  return api.post('/motos', datos);
}

export function actualizarMoto(id, datos) {
  return api.put(`/motos/${id}`, datos);
}

export function cambiarEstadoMoto(id, estado) {
  return api.patch(`/motos/${id}/estado`, { estado });
}
