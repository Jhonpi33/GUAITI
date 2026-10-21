import api from './api';

export function listarAdelantos(params = {}) {
  return api.get('/adelantos', { params });
}

export function crearAdelanto(datos) {
  return api.post('/adelantos', datos);
}

/** Admin/secretario aprueban o rechazan: estado 'aprobado' | 'rechazado'. */
export function cambiarEstadoAdelanto(id, estado) {
  return api.patch(`/adelantos/${id}/estado`, { estado });
}
