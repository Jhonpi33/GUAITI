/**
 * Envuelve los controladores para propagar las promesas rechazadas
 * al middleware global de errores (Express 4 no lo hace solo).
 */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/**
 * Error de aplicación con mensaje en español y código HTTP.
 */
export class AppError extends Error {
  constructor(message, status = 400, errores = null) {
    super(message);
    this.status = status;
    this.errores = errores;
    this.esAppError = true;
  }
}
