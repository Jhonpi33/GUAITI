import Moto from '../models/Moto.js';
import { AppError } from '../utils/asyncHandler.js';
import { datosPaginados } from '../utils/response.js';

export async function listarMotos({ q = '', pagina, limite, estado = '' }) {
  const filtro = {};
  if (estado) filtro.estado = estado;
  if (q) {
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filtro.nombre = regex;
  }

  const [items, total] = await Promise.all([
    Moto.find(filtro)
      .sort({ nombre: 1 })
      .skip((pagina - 1) * limite)
      .limit(limite),
    Moto.countDocuments(filtro),
  ]);

  return datosPaginados(items, total, pagina, limite);
}

export async function obtenerMoto(id) {
  const moto = await Moto.findById(id);
  if (!moto) throw new AppError('Moto no encontrada', 404);
  return moto;
}

export async function crearMoto(datos, creadorId) {
  const nombre = datos.nombre.trim();
  const existe = await Moto.findOne({ nombre });
  if (existe) throw new AppError(`Ya existe una moto llamada "${nombre}"`, 409);

  return Moto.create({ ...datos, nombre, createdBy: creadorId, updatedBy: creadorId });
}

export async function actualizarMoto(id, datos, editorId) {
  const moto = await obtenerMoto(id);

  if (datos.nombre && datos.nombre.trim() !== moto.nombre) {
    const duplicada = await Moto.findOne({ nombre: datos.nombre.trim(), _id: { $ne: id } });
    if (duplicada) throw new AppError(`Ya existe una moto llamada "${datos.nombre.trim()}"`, 409);
  }

  Object.assign(moto, datos);
  moto.updatedBy = editorId;
  await moto.save();
  return moto;
}

export async function cambiarEstadoMoto(id, estado, editorId) {
  const moto = await obtenerMoto(id);
  moto.estado = estado;
  moto.updatedBy = editorId;
  await moto.save();
  return moto;
}
