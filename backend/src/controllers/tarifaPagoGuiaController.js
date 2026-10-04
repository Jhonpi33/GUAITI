import * as tarifaService from '../services/tarifaPagoGuiaService.js';
import { responderOk } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listar = asyncHandler(async (req, res) => {
  const data = await tarifaService.listarTarifas({
    q: req.query.q || '',
    pagina: parseInt(req.query.page, 10) || 1,
    limite: parseInt(req.query.limit, 10) || 10,
    actividadId: req.query.actividadId || '',
    unidad: req.query.unidad || '',
  });
  return responderOk(res, data, 'Tarifas listadas correctamente');
});

export const obtener = asyncHandler(async (req, res) => {
  const data = await tarifaService.obtenerTarifa(req.params.id);
  return responderOk(res, data, 'Tarifa encontrada');
});

export const crear = asyncHandler(async (req, res) => {
  const data = await tarifaService.crearTarifa(req.body, req.usuario.id);
  return responderOk(res, data, 'Tarifa creada correctamente', 201);
});

export const actualizar = asyncHandler(async (req, res) => {
  const data = await tarifaService.actualizarTarifa(req.params.id, req.body, req.usuario.id);
  return responderOk(res, data, 'Tarifa actualizada correctamente');
});

export const eliminar = asyncHandler(async (req, res) => {
  const data = await tarifaService.eliminarTarifa(req.params.id);
  return responderOk(res, data, 'Tarifa eliminada correctamente');
});
