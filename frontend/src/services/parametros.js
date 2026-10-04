import api from './api';

export function listarParametros(params = {}) {
  return api.get('/parametros', { params });
}

export function obtenerMapaParametros() {
  return api.get('/parametros/mapa');
}

export function actualizarParametro(clave, datos) {
  return api.put(`/parametros/${clave}`, datos);
}
