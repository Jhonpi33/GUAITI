import * as bitacoraService from '../services/bitacoraService.js';
import { responderOk } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listar = asyncHandler(async (req, res) => {
  const data = await bitacoraService.listarBitacora({
    rol: req.usuario.rol,
    guiaPropiaId: req.guia?._id,
    fecha: req.query.fecha,
    motoId: req.query.motoId,
    guiaId: req.query.guiaId,
    salidaId: req.query.salidaId,
    pagina: parseInt(req.query.page, 10) || 1,
    limite: parseInt(req.query.limit, 10) || 10,
  });
  return responderOk(res, data, 'Bitácora listada correctamente');
});

export const crear = asyncHandler(async (req, res) => {
  const data = await bitacoraService.crearBitacora(req.body, {
    usuario: req.usuario,
    guiaPropiaId: req.guia?._id,
  });
  return responderOk(res, data, 'Registro de bitácora creado correctamente', 201);
});

export const actualizar = asyncHandler(async (req, res) => {
  const data = await bitacoraService.actualizarBitacora(req.params.id, req.body, {
    usuario: req.usuario,
    guiaPropiaId: req.guia?._id,
  });
  return responderOk(res, data, 'Registro de bitácora actualizado correctamente');
});
