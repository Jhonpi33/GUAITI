import { AppError } from '../utils/asyncHandler.js';

/**
 * Valida req[fuente] con un esquema Joi y reemplaza el valor
 * con el resultado sanitizado.
 */
export function validar(esquema, fuente = 'body') {
  return (req, _res, next) => {
    const { error, value } = esquema.validate(req[fuente], {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      const errores = error.details.map((d) => d.message.replace(/"/g, ''));
      return next(new AppError('Datos inválidos', 400, errores));
    }

    req[fuente] = value;
    next();
  };
}
