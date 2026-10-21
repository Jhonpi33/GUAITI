import api from './api';

/** Panel del guía: salidas de hoy, totales pendientes (GET /panel-guia?fecha=). */
export function obtenerPanelGuia(fecha) {
  return api.get('/panel-guia', { params: fecha ? { fecha } : {} });
}
