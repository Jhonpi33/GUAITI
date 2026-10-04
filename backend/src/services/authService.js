import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Usuario from '../models/Usuario.js';
import { AppError } from '../utils/asyncHandler.js';

const DURACION_TOKEN = '8h';

function generarToken(usuario) {
  return jwt.sign({ id: usuario._id, rol: usuario.rol }, process.env.JWT_SECRET, {
    expiresIn: DURACION_TOKEN,
  });
}

export async function login(correo, password) {
  const usuario = await Usuario.findOne({ correo: String(correo).toLowerCase().trim() }).select(
    '+passwordHash'
  );

  if (!usuario) {
    throw new AppError('Correo o contraseña incorrectos', 401);
  }
  if (!usuario.activo) {
    throw new AppError('Su cuenta está desactivada. Contacte al administrador', 403);
  }

  const coincide = await bcrypt.compare(password, usuario.passwordHash);
  if (!coincide) {
    throw new AppError('Correo o contraseña incorrectos', 401);
  }

  return {
    token: generarToken(usuario),
    usuario: {
      id: usuario._id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol,
    },
  };
}

export async function obtenerUsuarioPorId(id) {
  const usuario = await Usuario.findById(id);
  if (!usuario) {
    throw new AppError('Usuario no encontrado', 404);
  }
  if (!usuario.activo) {
    throw new AppError('Su cuenta está desactivada. Contacte al administrador', 403);
  }
  return usuario;
}
