import multer from 'multer';
import { AppError } from '../utils/asyncHandler.js';

const MIME_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];
const LIMITE_BYTES = 8 * 1024 * 1024; // 8 MB

/**
 * Almacenamiento en memoria: el archivo se procesa en el momento
 * (Cloudinary por streaming o disco local) y nunca se guarda en temporal.
 */
const almacenamiento = multer.memoryStorage();

/**
 * Filtro: solo imágenes jpg/png/webp de hasta 8 MB.
 */
function filtroDeArchivo(req, file, cb) {
  if (!MIME_PERMITIDOS.includes(file.mimetype)) {
    return cb(new AppError('Solo se pueden subir imágenes', 400));
  }
  return cb(null, true);
}

/**
 * Middleware de subida. Acepta cualquier campo ('archivo', 'fotos',
 * 'fotoSoporte' o JSON puro: multer se salta las peticiones que no
 * son multipart).
 */
export const subida = multer({
  storage: almacenamiento,
  fileFilter: filtroDeArchivo,
  limits: { fileSize: LIMITE_BYTES },
});

/** Devuelve el primer archivo subido con el campo indicado. */
export function archivoDe(req, campo) {
  if (!Array.isArray(req.files)) return null;
  const archivo = req.files.find((f) => f.fieldname === campo);
  return archivo || null;
}

/** Devuelve todos los archivos subidos con el campo indicado. */
export function archivosDe(req, campo) {
  if (!Array.isArray(req.files)) return [];
  return req.files.filter((f) => f.fieldname === campo);
}
