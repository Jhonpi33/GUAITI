import * as reportesDanioService from '../services/reportesDanioService.js';
import { responderOk } from '../utils/response.js';
import { asyncHandler, AppError } from '../utils/asyncHandler.js';
import { archivosDe } from '../middlewares/upload.js';
import { subirTodos } from './uploadController.js';

export const listar = asyncHandler(async (req, res) => {
  const data = await reportesDanioService.listarReportes({
    rol: req.usuario.rol,
    guiaPropiaId: req.guia?._id,
    estado: req.query.estado || '',
    motoId: req.query.motoId,
    guiaId: req.query.guiaId,
    fecha: req.query.fecha,
    pagina: parseInt(req.query.page, 10) || 1,
    limite: parseInt(req.query.limit, 10) || 10,
  });
  return responderOk(res, data, 'Reportes de daño listados correctamente');
});

export const crear = asyncHandler(async (req, res) => {
  // Acepta multipart (campo "fotos[]"/"fotos") o JSON con fotos: [url]
  let fotos = Array.isArray(req.body.fotos) ? req.body.fotos.filter(Boolean) : [];

  const archivos = archivosDe(req, 'fotos');
  if (archivos.length) {
    fotos = [...fotos, ...(await subirTodos(req, 'fotos'))];
  }

  const archivosUnicos = archivosDe(req, 'archivo');
  if (archivosUnicos.length) {
    fotos = [...fotos, ...(await subirTodos(req, 'archivo'))];
  }

  if (!req.body.descripcion) throw new AppError('La descripción es obligatoria', 400);

  const data = await reportesDanioService.crearReporte(
    { ...req.body, fotos },
    { usuario: req.usuario, guiaPropiaId: req.guia?._id, fotos }
  );
  return responderOk(res, data, 'Reporte de daño creado correctamente', 201);
});

export const cambiarEstado = asyncHandler(async (req, res) => {
  const data = await reportesDanioService.cambiarEstadoReporte(
    req.params.id,
    req.body.estado,
    req.usuario._id
  );
  return responderOk(res, data, 'Estado del reporte actualizado correctamente');
});
