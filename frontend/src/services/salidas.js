import api from './api';

export function listarSalidas(params = {}) {
  return api.get('/salidas', { params });
}

export function obtenerSalida(id) {
  return api.get(`/salidas/${id}`);
}

export function crearSalida(datos, config = {}) {
  return api.post('/salidas', datos, config);
}

/** Cambia a 'en_curso' o 'cerrada'; al cerrar envía novedades y cascosEstado. */
export function cambiarEstadoSalida(id, datos) {
  return api.patch(`/salidas/${id}/estado`, datos);
}

/** Admin/secretario autorizan superar el máximo de motos por guía. */
export function autorizarExcepcionMotos(id) {
  return api.put(`/salidas/${id}/excepcion`, { excepcionMotos: true });
}
