import bcrypt from 'bcryptjs';
import Guia from '../models/Guia.js';
import Usuario from '../models/Usuario.js';
import { AppError } from '../utils/asyncHandler.js';
import { datosPaginados } from '../utils/response.js';

export async function listarGuias({ q = '', pagina, limite, soloActivos = false }) {
  const filtro = {};
  if (soloActivos) filtro.activo = true;
  if (q) {
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filtro.nombre = regex;
  }

  const [items, total] = await Promise.all([
    Guia.find(filtro)
      .populate('usuarioId', 'correo rol activo')
      .sort({ nombre: 1 })
      .skip((pagina - 1) * limite)
      .limit(limite),
    Guia.countDocuments(filtro),
  ]);

  return datosPaginados(items, total, pagina, limite);
}

export async function obtenerGuia(id) {
  const guia = await Guia.findById(id).populate('usuarioId', 'correo rol activo');
  if (!guia) throw new AppError('Guía no encontrado', 404);
  return guia;
}

/**
 * Crea un guía y, opcionalmente, su usuario con rol 'guia'.
 */
export async function crearGuia(datos, creadorId) {
  let usuarioId = null;

  if (datos.crearUsuario) {
    const correo = datos.correo.toLowerCase().trim();
    const existe = await Usuario.findOne({ correo });
    if (existe) throw new AppError('Ya existe un usuario con ese correo', 409);

    const passwordHash = await bcrypt.hash(datos.password, 10);
    const usuario = await Usuario.create({
      nombre: datos.nombre,
      correo,
      passwordHash,
      rol: 'guia',
      activo: true,
      createdBy: creadorId,
      updatedBy: creadorId,
    });
    usuarioId = usuario._id;
  }

  const guia = await Guia.create({
    nombre: datos.nombre,
    telefono: datos.telefono ?? '',
    activo: datos.activo ?? true,
    usuarioId,
    createdBy: creadorId,
    updatedBy: creadorId,
  });

  return obtenerGuia(guia._id);
}

export async function actualizarGuia(id, datos, editorId) {
  const guia = await Guia.findById(id);
  if (!guia) throw new AppError('Guía no encontrado', 404);

  if (datos.nombre !== undefined) guia.nombre = datos.nombre;
  if (datos.telefono !== undefined) guia.telefono = datos.telefono;
  if (datos.activo !== undefined) {
    guia.activo = datos.activo;
    // Si el guía tiene usuario vinculado, se activa o desactiva en conjunto
    if (guia.usuarioId) {
      await Usuario.updateOne({ _id: guia.usuarioId }, { $set: { activo: datos.activo } });
    }
  }

  guia.updatedBy = editorId;
  await guia.save();
  return obtenerGuia(guia._id);
}

/**
 * No se borran guías: se desactivan.
 */
export async function desactivarGuia(id, editorId) {
  const guia = await Guia.findById(id);
  if (!guia) throw new AppError('Guía no encontrado', 404);

  guia.activo = false;
  guia.updatedBy = editorId;
  await guia.save();

  if (guia.usuarioId) {
    await Usuario.updateOne({ _id: guia.usuarioId }, { $set: { activo: false } });
  }

  return obtenerGuia(guia._id);
}
