import * as parametroService from '../services/parametroService.js';
import { responderOk } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listar = asyncHandler(async (req, res) => {
  const data = await parametroService.listarParametros({
    q: req.query.q || '',
    pagina: parseInt(req.query.page, 10) || 1,
    limite: parseInt(req.query.limit, 10) || 100,
  });
  return responderOk(res, data, 'Parámetros listados correctamente');
});

export const mapa = asyncHandler(async (_req, res) => {
  const data = await parametroService.obtenerParametrosComoMapa();
  return responderOk(res, data, 'Parámetros cargados correctamente');
});

export const obtener = asyncHandler(async (req, res) => {
  const data = await parametroService.obtenerParametro(req.params.clave);
  return responderOk(res, data, 'Parámetro encontrado');
});

export const editar = asyncHandler(async (req, res) => {
  const data = await parametroService.editarParametro(
    req.params.clave,
    req.body,
    req.usuario.id
  );
  return responderOk(res, data, 'Parámetro actualizado correctamente');
});
