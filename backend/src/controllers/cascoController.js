import * as cascosService from '../services/cascosService.js';
import { responderOk } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listar = asyncHandler(async (req, res) => {
  const data = await cascosService.listarCascos({
    estado: req.query.estado || '',
    q: req.query.q || '',
    pagina: parseInt(req.query.page, 10) || 1,
    limite: parseInt(req.query.limit, 10) || 50,
  });
  return responderOk(res, data, 'Cascos listados correctamente');
});

export const obtener = asyncHandler(async (req, res) => {
  const data = await cascosService.obtenerCasco(req.params.id);
  return responderOk(res, data, 'Casco encontrado');
});

export const crear = asyncHandler(async (req, res) => {
  const data = await cascosService.crearCasco(req.body, req.usuario._id);
  return responderOk(res, data, 'Casco creado correctamente', 201);
});

export const actualizar = asyncHandler(async (req, res) => {
  const data = await cascosService.actualizarCasco(req.params.id, req.body, req.usuario._id);
  return responderOk(res, data, 'Casco actualizado correctamente');
});

export const eliminar = asyncHandler(async (req, res) => {
  const data = await cascosService.eliminarCasco(req.params.id);
  return responderOk(res, data, 'Casco eliminado correctamente');
});

export const ajustarRango = asyncHandler(async (req, res) => {
  const data = await cascosService.ajustarRangoCascos(req.body, req.usuario._id);
  return responderOk(res, data, 'Rango de cascos actualizado correctamente');
});
