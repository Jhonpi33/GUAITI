import { login, obtenerUsuarioPorId } from '../services/authService.js';
import { responderOk } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const iniciarSesion = asyncHandler(async (req, res) => {
  const { correo, password } = req.body;
  const resultado = await login(correo, password);
  return responderOk(res, resultado, 'Sesión iniciada correctamente');
});

export const obtenerSesion = asyncHandler(async (req, res) => {
  const usuario = await obtenerUsuarioPorId(req.usuario.id);
  return responderOk(res, usuario, 'Sesión válida');
});
