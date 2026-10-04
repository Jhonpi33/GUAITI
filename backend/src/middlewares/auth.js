import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario.js';
import { asyncHandler, AppError } from '../utils/asyncHandler.js';

/**
 * Verifica el token JWT y adjunta el usuario a la petición (req.usuario).
 */
export const auth = asyncHandler(async (req, _res, next) => {
  const cabecera = req.headers.authorization || '';
  const [tipo, token] = cabecera.split(' ');

  if (tipo !== 'Bearer' || !token) {
    throw new AppError('No autorizado: falta el token de acceso', 401);
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (_e) {
    throw new AppError('No autorizado: el token es inválido o expiró', 401);
  }

  const usuario = await Usuario.findById(payload.id);
  if (!usuario) {
    throw new AppError('No autorizado: el usuario ya no existe', 401);
  }
  if (!usuario.activo) {
    throw new AppError('Su cuenta está desactivada. Contacte al administrador', 403);
  }

  req.usuario = usuario;
  next();
});
