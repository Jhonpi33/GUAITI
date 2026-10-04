import * as clienteService from '../services/clienteService.js';
import { responderOk } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listar = asyncHandler(async (req, res) => {
  const data = await clienteService.listarClientes({
    q: req.query.q || '',
    pagina: parseInt(req.query.page, 10) || 1,
    limite: parseInt(req.query.limit, 10) || 10,
  });
  return responderOk(res, data, 'Clientes listados correctamente');
});

export const obtener = asyncHandler(async (req, res) => {
  const data = await clienteService.obtenerCliente(req.params.id);
  return responderOk(res, data, 'Cliente encontrado');
});

export const crear = asyncHandler(async (req, res) => {
  const data = await clienteService.crearCliente(req.body, req.usuario.id);
  return responderOk(res, data, 'Cliente creado correctamente', 201);
});

export const actualizar = asyncHandler(async (req, res) => {
  const data = await clienteService.actualizarCliente(req.params.id, req.body, req.usuario.id);
  return responderOk(res, data, 'Cliente actualizado correctamente');
});

export const eliminar = asyncHandler(async (req, res) => {
  const data = await clienteService.eliminarCliente(req.params.id);
  return responderOk(res, data, 'Cliente eliminado correctamente');
});
