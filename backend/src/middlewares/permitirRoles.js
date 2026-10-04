import { AppError } from '../utils/asyncHandler.js';

/**
 * Restringe el acceso a una lista de roles.
 * Uso: router.get('/', auth, permitirRoles('admin', 'secretario'), controlador)
 */
export function permitirRoles(...roles) {
  return (req, _res, next) => {
    if (!req.usuario) {
      return next(new AppError('No autorizado: falta autenticación', 401));
    }
    if (!roles.includes(req.usuario.rol)) {
      return next(
        new AppError('No tiene permisos para realizar esta acción', 403)
      );
    }
    next();
  };
}
