import Actividad from '../models/Actividad.js';
import { AppError } from '../utils/asyncHandler.js';
import { datosPaginados } from '../utils/response.js';

export async function listarActividades({ q = '', pagina, limite, soloActivas = false, incluirInactivas = true }) {
  const filtro = {};
  if (soloActivas) filtro.activa = true;
  if (!incluirInactivas) filtro.activa = true;
  if (q) {
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filtro.nombre = regex;
  }

  const [items, total] = await Promise.all([
    Actividad.find(filtro)
      .sort({ nombre: 1 })
      .skip((pagina - 1) * limite)
      .limit(limite),
    Actividad.countDocuments(filtro),
  ]);

  return datosPaginados(items, total, pagina, limite);
}

export async function obtenerActividad(id) {
  const actividad = await Actividad.findById(id);
  if (!actividad) throw new AppError('Actividad no encontrada', 404);
  return actividad;
}

export async function crearActividad(datos, creadorId) {
  const existe = await Actividad.findOne({ nombre: datos.nombre.trim() });
  if (existe) throw new AppError('Ya existe una actividad con ese nombre', 409);

  return Actividad.create({ ...datos, createdBy: creadorId, updatedBy: creadorId });
}

export async function actualizarActividad(id, datos, editorId) {
  const actividad = await obtenerActividad(id);

  if (datos.nombre && datos.nombre.trim() !== actividad.nombre) {
    const duplicada = await Actividad.findOne({ nombre: datos.nombre.trim(), _id: { $ne: id } });
    if (duplicada) throw new AppError('Ya existe una actividad con ese nombre', 409);
  }

  Object.assign(actividad, datos);
  actividad.updatedBy = editorId;
  await actividad.save();
  return actividad;
}
