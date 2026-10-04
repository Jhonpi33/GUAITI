import * as motoService from '../services/motoService.js';
import { responderOk } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listar = asyncHandler(async (req, res) => {
  const data = await motoService.listarMotos({
    q: req.query.q || '',
    pagina: parseInt(req.query.page, 10) || 1,
    limite: parseInt(req.query.limit, 10) || 10,
    estado: req.query.estado || '',
  });
  return responderOk(res, data, 'Motos listadas correctamente');
});

export const obtener = asyncHandler(async (req, res) => {
  const data = await motoService.obtenerMoto(req.params.id);
  return responderOk(res, data, 'Moto encontrada');
});

export const crear = asyncHandler(async (req, res) => {
  const data = await motoService.crearMoto(req.body, req.usuario.id);
  return responderOk(res, data, 'Moto creada correctamente', 201);
});

export const actualizar = asyncHandler(async (req, res) => {
  const data = await motoService.actualizarMoto(req.params.id, req.body, req.usuario.id);
  return responderOk(res, data, 'Moto actualizada correctamente');
});

export const cambiarEstado = asyncHandler(async (req, res) => {
  const data = await motoService.cambiarEstadoMoto(
    req.params.id,
    req.body.estado,
    req.usuario.id
  );
  return responderOk(res, data, 'Estado de la moto actualizado correctamente');
});
