import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { v2 as cloudinary } from 'cloudinary';
import { AppError } from '../utils/asyncHandler.js';

const RUTA_LOCAL = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  'uploads'
);

const EXTENSIONES = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const CLAVES_CLOUDINARY = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
];

/** Cloudinary solo se usa si las tres credenciales están en el .env. */
export function cloudinaryConfigurado() {
  return CLAVES_CLOUDINARY.every((clave) => (process.env[clave] || '').trim() !== '');
}

async function subirACloudinary(buffer) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME.trim(),
    api_key: process.env.CLOUDINARY_API_KEY.trim(),
    api_secret: process.env.CLOUDINARY_API_SECRET.trim(),
    secure: true,
  });

  try {
    const resultado = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'guaiti',
          transformation: [
            { width: 1600, height: 1600, crop: 'limit', quality: 'auto', fetch_format: 'auto' },
          ],
        },
        (error, respuesta) => (error ? reject(error) : resolve(respuesta))
      );
      stream.end(buffer);
    });
    return { url: resultado.secure_url, modo: 'cloudinary' };
  } catch (error) {
    throw new AppError(`No fue posible subir la imagen a Cloudinary: ${error.message}`, 502);
  }
}

async function guardarLocal(buffer, mimetype) {
  await fs.mkdir(RUTA_LOCAL, { recursive: true });
  const nombre = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${EXTENSIONES[mimetype] || ''}`;
  await fs.writeFile(path.join(RUTA_LOCAL, nombre), buffer);
  return { url: `/uploads/${nombre}`, modo: 'local' };
}

/**
 * Sube una imagen: a Cloudinary si hay credenciales, o a la carpeta
 * `backend/uploads/` (servida en /uploads) si no las hay.
 */
export async function subirImagen(buffer, mimetype) {
  if (cloudinaryConfigurado()) return subirACloudinary(buffer);
  return guardarLocal(buffer, mimetype);
}
