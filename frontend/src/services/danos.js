import api from './api';

export function listarReportesDanio(params = {}) {
  return api.get('/reportes-danio', { params });
}

export function crearReporteDanio(datos) {
  return api.post('/reportes-danio', datos);
}

/** Admin/secretario cambian el estado: reportado | en_reparacion | resuelto. */
export function cambiarEstadoReporte(id, estado) {
  return api.patch(`/reportes-danio/${id}/estado`, { estado });
}
