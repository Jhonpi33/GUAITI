import Guia from '../models/Guia.js';
import { asyncHandler, AppError } from '../utils/asyncHandler.js';

/**
 * Para el rol 'guia' resuelve la ficha Guia vinculada al usuario
 * (Guia.usuarioId = req.usuario._id) y la adjunta a req.guia.
 * Si no existe la ficha → 400 "Su usuario no está vinculado a una ficha de guía".
 * Para admin/secretario no hace nada (no hay ficha que resolver).
 */
export const resolverGuia = asyncHandler(async (req, _res, next) => {
  if (req.usuario?.rol !== 'guia') return next();

  const guia = await Guia.findOne({ usuarioId: req.usuario._id });
  if (!guia) {
    throw new AppError('Su usuario no está vinculado a una ficha de guía', 400);
  }
  if (!guia.activo) {
    throw new AppError('Su ficha de guía está inactiva. Contacte al administrador', 403);
  }

  req.guia = guia;
  return next();
});
