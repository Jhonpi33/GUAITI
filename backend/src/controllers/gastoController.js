import * as gastosService from '../services/gastosService.js';
import { subirImagen } from '../services/uploadService.js';
import { responderOk } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { archivoDe } from '../middlewares/upload.js';

export const listar = asyncHandler(async (req, res) => {
  const data = await gastosService.listarGastos({
    tipo: req.query.tipo || '',
    fechaDesde: req.query.fechaDesde || req.query.desde || '',
    fechaHasta: req.query.fechaHasta || req.query.hasta || '',
    pagina: parseInt(req.query.page, 10) || 1,
    limite: parseInt(req.query.limit, 10) || 10,
  });
  return responderOk(res, data, 'Gastos listados correctamente');
});

export const crear = asyncHandler(async (req, res) => {
  let fotoSoporte = req.body.fotoSoporte || '';
  const archivo = archivoDe(req, 'fotoSoporte');
  if (archivo) {
    const subida = await subirImagen(archivo.buffer, archivo.mimetype);
    fotoSoporte = subida.url;
  }

  const data = await gastosService.crearGasto(req.body, req.usuario, fotoSoporte);
  return responderOk(res, data, 'Gasto registrado correctamente', 201);
});

export const actualizar = asyncHandler(async (req, res) => {
  let fotoSoporte;
  const archivo = archivoDe(req, 'fotoSoporte');
  if (archivo) {
    const subida = await subirImagen(archivo.buffer, archivo.mimetype);
    fotoSoporte = subida.url;
  }

  const datos = { ...req.body };
  if (fotoSoporte) datos.fotoSoporte = fotoSoporte;

  const data = await gastosService.actualizarGasto(req.params.id, datos, req.usuario._id);
  return responderOk(res, data, 'Gasto actualizado correctamente');
});

export const eliminar = asyncHandler(async (req, res) => {
  const data = await gastosService.eliminarGasto(req.params.id);
  return responderOk(res, data, 'Gasto eliminado correctamente');
});
