import * as adelantosService from '../services/adelantosService.js';
import { responderOk } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listar = asyncHandler(async (req, res) => {
  const data = await adelantosService.listarAdelantos({
    rol: req.usuario.rol,
    guiaPropiaId: req.guia?._id,
    estado: req.query.estado || '',
    guiaId: req.query.guiaId,
    pagina: parseInt(req.query.page, 10) || 1,
    limite: parseInt(req.query.limit, 10) || 10,
  });
  return responderOk(res, data, 'Adelantos listados correctamente');
});

export const crear = asyncHandler(async (req, res) => {
  const data = await adelantosService.crearAdelanto(req.body, {
    usuario: req.usuario,
    guiaPropiaId: req.guia._id,
  });
  return responderOk(res, data, 'Adelanto solicitado correctamente', 201);
});

export const cambiarEstado = asyncHandler(async (req, res) => {
  const data = await adelantosService.cambiarEstadoAdelanto(
    req.params.id,
    req.body.estado,
    req.usuario._id
  );
  return responderOk(res, data, 'Adelanto actualizado correctamente');
});
