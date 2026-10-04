import * as usuarioService from '../services/usuarioService.js';
import { responderOk } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listar = asyncHandler(async (req, res) => {
  const data = await usuarioService.listarUsuarios({
    q: req.query.q || '',
    pagina: parseInt(req.query.page, 10) || 1,
    limite: parseInt(req.query.limit, 10) || 10,
  });
  return responderOk(res, data, 'Usuarios listados correctamente');
});

export const obtener = asyncHandler(async (req, res) => {
  const data = await usuarioService.obtenerUsuario(req.params.id);
  return responderOk(res, data, 'Usuario encontrado');
});

export const crear = asyncHandler(async (req, res) => {
  const data = await usuarioService.crearUsuario(req.body, req.usuario.id);
  return responderOk(res, data, 'Usuario creado correctamente', 201);
});

export const actualizar = asyncHandler(async (req, res) => {
  const data = await usuarioService.actualizarUsuario(req.params.id, req.body, req.usuario.id);
  return responderOk(res, data, 'Usuario actualizado correctamente');
});
