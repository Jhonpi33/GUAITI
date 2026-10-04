import api from './api';

export function listarTarifas(params = {}) {
  return api.get('/tarifas-pago-guia', { params });
}

export function crearTarifa(datos) {
  return api.post('/tarifas-pago-guia', datos);
}

export function actualizarTarifa(id, datos) {
  return api.put(`/tarifas-pago-guia/${id}`, datos);
}

export function eliminarTarifa(id) {
  return api.delete(`/tarifas-pago-guia/${id}`);
}
