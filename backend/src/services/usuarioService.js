import bcrypt from 'bcryptjs';
import Usuario from '../models/Usuario.js';
import { AppError } from '../utils/asyncHandler.js';
import { datosPaginados } from '../utils/response.js';

export async function listarUsuarios({ q = '', pagina, limite }) {
  const filtro = {};
  if (q) {
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filtro.$or = [{ nombre: regex }, { correo: regex }];
  }

  const [items, total] = await Promise.all([
    Usuario.find(filtro)
      .sort({ nombre: 1 })
      .skip((pagina - 1) * limite)
      .limit(limite),
    Usuario.countDocuments(filtro),
  ]);

  return datosPaginados(items, total, pagina, limite);
}

export async function crearUsuario(datos, creadorId) {
  const correo = datos.correo.toLowerCase().trim();

  const existe = await Usuario.findOne({ correo });
  if (existe) {
    throw new AppError('Ya existe un usuario con ese correo', 409);
  }

  const passwordHash = await bcrypt.hash(datos.password, 10);
  const usuario = await Usuario.create({
    nombre: datos.nombre,
    correo,
    passwordHash,
    rol: datos.rol,
    activo: datos.activo ?? true,
    createdBy: creadorId,
    updatedBy: creadorId,
  });

  return usuario;
}

export async function obtenerUsuario(id) {
  const usuario = await Usuario.findById(id);
  if (!usuario) throw new AppError('Usuario no encontrado', 404);
  return usuario;
}

export async function actualizarUsuario(id, datos, editorId) {
  const usuario = await obtenerUsuario(id);

  if (datos.correo) {
    const correo = datos.correo.toLowerCase().trim();
    const duplicado = await Usuario.findOne({ correo, _id: { $ne: id } });
    if (duplicado) throw new AppError('Ya existe un usuario con ese correo', 409);
    usuario.correo = correo;
  }

  if (datos.nombre !== undefined) usuario.nombre = datos.nombre;
  if (datos.rol !== undefined) usuario.rol = datos.rol;
  if (datos.activo !== undefined) usuario.activo = datos.activo;

  if (datos.password) {
    usuario.passwordHash = await bcrypt.hash(datos.password, 10);
  }

  usuario.updatedBy = editorId;
  await usuario.save();
  return usuario;
}
