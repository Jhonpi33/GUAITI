import { responderError } from '../utils/response.js';

/**
 * Middleware 404: ruta no encontrada.
 */
export function noEncontrado(req, _res, next) {
  const err = new Error(`Ruta no encontrada: ${req.method} ${req.originalUrl}`);
  err.status = 404;
  next(err);
}

/**
 * Middleware global de manejo de errores.
 * Siempre responde { ok, data, message } con el mensaje en español.
 */
// eslint-disable-next-line no-unused-vars
export function manejadorDeErrores(err, _req, res, _next) {
  const status = err.status || err.statusCode || 500;
  let message = err.message || 'Error interno del servidor';
  let errores = err.errores || null;

  // Errores de Mongoose
  if (err.name === 'ValidationError') {
    message = 'Datos inválidos';
    errores = Object.values(err.errors).map((e) => e.message);
  } else if (err.name === 'CastError') {
    message = 'El identificador recibido no es válido';
  } else if (err.code === 11000) {
    const campo = Object.keys(err.keyValue || {})[0] || 'campo';
    message = `Ya existe un registro con ese valor en ${campo}`;
  }

  if (status >= 500) {
    console.error('[error]', err);
  }

  return responderError(res, message, status, errores);
}
