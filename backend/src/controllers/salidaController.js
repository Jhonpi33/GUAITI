import * as salidasService from '../services/salidasService.js';
import { responderOk } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listar = asyncHandler(async (req, res) => {
  const data = await salidasService.listarSalidas({
    rol: req.usuario.rol,
    guiaPropiaId: req.guia?._id,
    fecha: req.query.fecha,
    guiaId: req.query.guiaId,
    estado: req.query.estado,
    pagina: parseInt(req.query.page, 10) || 1,
    limite: parseInt(req.query.limit, 10) || 10,
  });
  return responderOk(res, data, 'Salidas listadas correctamente');
});

export const obtener = asyncHandler(async (req, res) => {
  const data = await salidasService.obtenerSalida(req.params.id, {
    rol: req.usuario.rol,
    guiaPropiaId: req.guia?._id,
  });
  return responderOk(res, data, 'Salida encontrada');
});

export const crear = asyncHandler(async (req, res) => {
  const data = await salidasService.crearSalida(req.body, {
    usuario: req.usuario,
    guiaPropiaId: req.guia?._id,
  });
  return responderOk(res, data, 'Salida creada correctamente', 201);
});

export const cambiarEstado = asyncHandler(async (req, res) => {
  const data = await salidasService.cambiarEstadoSalida(req.params.id, req.body, {
    usuario: req.usuario,
    guiaPropiaId: req.guia?._id,
  });
  return responderOk(res, data, 'Salida actualizada correctamente');
});

export const autorizarExcepcion = asyncHandler(async (req, res) => {
  const data = await salidasService.autorizarExcepcion(req.params.id, req.usuario._id);
  return responderOk(res, data, 'Excepción de motos autorizada correctamente');
});
