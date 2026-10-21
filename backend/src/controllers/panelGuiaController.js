import * as panelGuiaService from '../services/panelGuiaService.js';
import { responderOk } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const obtenerPanel = asyncHandler(async (req, res) => {
  const data = await panelGuiaService.obtenerPanel({
    fecha: req.query.fecha,
    guia: req.guia,
  });
  return responderOk(res, data, 'Panel del guía listo');
});
