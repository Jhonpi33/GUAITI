import * as actividadService from '../services/actividadService.js';
import { responderOk } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listar = asyncHandler(async (req, res) => {
  const data = await actividadService.listarActividades({
    q: req.query.q || '',
    pagina: parseInt(req.query.page, 10) || 1,
    limite: parseInt(req.query.limit, 10) || 10,
    soloActivas: req.query.soloActivas === 'true',
  });
  return responderOk(res, data, 'Actividades listadas correctamente');
});

export const obtener = asyncHandler(async (req, res) => {
  const data = await actividadService.obtenerActividad(req.params.id);
  return responderOk(res, data, 'Actividad encontrada');
});

export const crear = asyncHandler(async (req, res) => {
  const data = await actividadService.crearActividad(req.body, req.usuario.id);
  return responderOk(res, data, 'Actividad creada correctamente', 201);
});

export const actualizar = asyncHandler(async (req, res) => {
  const data = await actividadService.actualizarActividad(req.params.id, req.body, req.usuario.id);
  return responderOk(res, data, 'Actividad actualizada correctamente');
});
