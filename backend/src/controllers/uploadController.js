import * as uploadService from '../services/uploadService.js';
import { responderOk } from '../utils/response.js';
import { asyncHandler, AppError } from '../utils/asyncHandler.js';
import { archivoDe, archivosDe } from '../middlewares/upload.js';

/**
 * POST /uploads/foto → campo multipart "archivo".
 * Devuelve { url } (Cloudinary o /uploads/... local).
 */
export const subirFoto = asyncHandler(async (req, res) => {
  const archivo = archivoDe(req, 'archivo');
  if (!archivo) throw new AppError('Debe adjuntar una imagen en el campo "archivo"', 400);

  const data = await uploadService.subirImagen(archivo.buffer, archivo.mimetype);
  return responderOk(res, data, 'Imagen subida correctamente', 201);
});

/** Sube todos los archivos del campo indicado y devuelve sus URLs. */
export async function subirTodos(req, campo) {
  const archivos = archivosDe(req, campo);
  const urls = [];
  for (const archivo of archivos) {
    const resultado = await uploadService.subirImagen(archivo.buffer, archivo.mimetype);
    urls.push(resultado.url);
  }
  return urls;
}
