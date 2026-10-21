import api from './api';

export function listarLiquidaciones(params = {}) {
  return api.get('/liquidaciones', { params });
}

export function crearLiquidacion(datos) {
  return api.post('/liquidaciones', datos);
}

/** Marca la liquidación como pagada (admin/secretario). */
export function marcarLiquidacionPagada(id, fechaPago) {
  return api.patch(`/liquidaciones/${id}/estado`, { estado: 'pagada', fechaPago });
}

/** Previsualización: guianzas pendientes, adelantos y base del guía. */
export function obtenerResumenLiquidacion(guiaId, params = {}) {
  return api.get(`/liquidaciones/resumen/${guiaId}`, { params });
}
