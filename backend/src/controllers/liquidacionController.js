import * as liquidacionesService from '../services/liquidacionesService.js';
import { responderOk } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listar = asyncHandler(async (req, res) => {
  // ?periodo=YYYY-MM-DD,YYYY-MM-DD (también acepta desde/hasta sueltos)
  let desde = req.query.desde || '';
  let hasta = req.query.hasta || '';
  if (req.query.periodo) {
    const [desdePeriodo, hastaPeriodo] = String(req.query.periodo).split(',');
    desde = desde || (desdePeriodo || '');
    hasta = hasta || (hastaPeriodo || '');
  }

  const data = await liquidacionesService.listarLiquidaciones({
    rol: req.usuario.rol,
    guiaPropiaId: req.guia?._id,
    guiaId: req.query.guiaId,
    estado: req.query.estado || '',
    desde,
    hasta,
    pagina: parseInt(req.query.page, 10) || 1,
    limite: parseInt(req.query.limit, 10) || 10,
  });
  return responderOk(res, data, 'Liquidaciones listadas correctamente');
});

export const resumen = asyncHandler(async (req, res) => {
  const data = await liquidacionesService.resumenPorGuia(req.params.guiaId, {
    rol: req.usuario.rol,
    guiaPropiaId: req.guia?._id,
    desde: req.query.desde || '',
    hasta: req.query.hasta || '',
  });
  return responderOk(res, data, 'Resumen de liquidación generado');
});

export const crear = asyncHandler(async (req, res) => {
  const data = await liquidacionesService.crearLiquidacion(req.body, req.usuario);
  return responderOk(res, data, 'Liquidación creada correctamente', 201);
});

export const cambiarEstado = asyncHandler(async (req, res) => {
  const data = await liquidacionesService.cambiarEstadoLiquidacion(
    req.params.id,
    req.body,
    req.usuario._id
  );
  return responderOk(res, data, 'Estado de la liquidación actualizado correctamente');
});
