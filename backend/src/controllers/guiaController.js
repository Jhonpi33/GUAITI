import * as guiaService from '../services/guiaService.js';
import { responderOk } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listar = asyncHandler(async (req, res) => {
  const data = await guiaService.listarGuias({
    q: req.query.q || '',
    pagina: parseInt(req.query.page, 10) || 1,
    limite: parseInt(req.query.limit, 10) || 10,
    soloActivos: req.query.soloActivos === 'true',
  });
  return responderOk(res, data, 'Guías listados correctamente');
});

export const obtener = asyncHandler(async (req, res) => {
  const data = await guiaService.obtenerGuia(req.params.id);
  return responderOk(res, data, 'Guía encontrado');
});

export const crear = asyncHandler(async (req, res) => {
  const data = await guiaService.crearGuia(req.body, req.usuario.id);
  return responderOk(res, data, 'Guía creado correctamente', 201);
});

export const actualizar = asyncHandler(async (req, res) => {
  const data = await guiaService.actualizarGuia(req.params.id, req.body, req.usuario.id);
  return responderOk(res, data, 'Guía actualizado correctamente');
});

export const desactivar = asyncHandler(async (req, res) => {
  const data = await guiaService.desactivarGuia(req.params.id, req.usuario.id);
  return responderOk(res, data, 'Guía desactivado correctamente');
});
