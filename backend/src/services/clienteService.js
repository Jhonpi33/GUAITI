import Cliente from '../models/Cliente.js';
import { AppError } from '../utils/asyncHandler.js';
import { datosPaginados } from '../utils/response.js';

export async function listarClientes({ q = '', pagina, limite }) {
  const filtro = {};
  if (q) {
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filtro.$or = [{ nombre: regex }, { cedula: regex }];
  }

  const [items, total] = await Promise.all([
    Cliente.find(filtro)
      .sort({ nombre: 1 })
      .skip((pagina - 1) * limite)
      .limit(limite),
    Cliente.countDocuments(filtro),
  ]);

  return datosPaginados(items, total, pagina, limite);
}

export async function obtenerCliente(id) {
  const cliente = await Cliente.findById(id);
  if (!cliente) throw new AppError('Cliente no encontrado', 404);
  return cliente;
}

export async function crearCliente(datos, creadorId) {
  const cedula = String(datos.cedula).trim();
  const existe = await Cliente.findOne({ cedula });
  if (existe) {
    throw new AppError(`Ya existe un cliente con la cédula ${cedula}`, 409);
  }

  return Cliente.create({ ...datos, cedula, createdBy: creadorId, updatedBy: creadorId });
}

export async function actualizarCliente(id, datos, editorId) {
  const cliente = await obtenerCliente(id);

  if (datos.cedula) {
    const cedula = String(datos.cedula).trim();
    const duplicado = await Cliente.findOne({ cedula, _id: { $ne: id } });
    if (duplicado) {
      throw new AppError(`Ya existe un cliente con la cédula ${cedula}`, 409);
    }
    datos.cedula = cedula;
  }

  Object.assign(cliente, datos);
  cliente.updatedBy = editorId;
  await cliente.save();
  return cliente;
}

export async function eliminarCliente(id) {
  const cliente = await Cliente.findByIdAndDelete(id);
  if (!cliente) throw new AppError('Cliente no encontrado', 404);
  return cliente;
}
