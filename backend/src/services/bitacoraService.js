import BitacoraMoto from '../models/BitacoraMoto.js';
import Salida from '../models/Salida.js';
import { AppError } from '../utils/asyncHandler.js';
import { datosPaginados } from '../utils/response.js';
import { rangoDia } from '../utils/fechas.js';

const POBLAR = [
  { path: 'motoId', select: 'nombre estado' },
  { path: 'guiaId', select: 'nombre' },
  { path: 'salidaId', select: 'fecha estado personas' },
];

export async function listarBitacora({ rol, guiaPropiaId, fecha, motoId, guiaId, salidaId, pagina, limite }) {
  const filtro = {};

  if (rol === 'guia') {
    if (guiaId && guiaId !== String(guiaPropiaId)) {
      throw new AppError('No tiene permisos para ver la bitácora de otro guía', 403);
    }
    filtro.guiaId = guiaPropiaId;
  } else if (guiaId) {
    filtro.guiaId = guiaId;
  }

  if (motoId) filtro.motoId = motoId;
  if (salidaId) filtro.salidaId = salidaId;
  const rango = rangoDia(fecha);
  if (rango) filtro.fecha = { $gte: rango.inicio, $lte: rango.fin };

  const [items, total] = await Promise.all([
    BitacoraMoto.find(filtro)
      .populate(POBLAR)
      .sort({ fecha: -1, createdAt: -1 })
      .skip((pagina - 1) * limite)
      .limit(limite),
    BitacoraMoto.countDocuments(filtro),
  ]);

  return datosPaginados(items, total, pagina, limite);
}

export async function obtenerBitacora(id) {
  const registro = await BitacoraMoto.findById(id).populate(POBLAR);
  if (!registro) throw new AppError('Registro de bitácora no encontrado', 404);
  return registro;
}

export async function crearBitacora(datos, { usuario, guiaPropiaId }) {
  const salida = await Salida.findById(datos.salidaId);
  if (!salida) throw new AppError('La salida indicada no existe', 404);

  if (usuario.rol === 'guia' && String(salida.guiaId) !== String(guiaPropiaId)) {
    throw new AppError('No tiene permisos para registrar en esta salida', 403);
  }

  const pertenece = (salida.motos || []).some((m) => String(m) === String(datos.motoId));
  if (!pertenece) {
    throw new AppError('La moto no pertenece a esa salida', 400);
  }

  const existe = await BitacoraMoto.findOne({
    salidaId: salida._id,
    motoId: datos.motoId,
  });
  if (existe) {
    throw new AppError('Ya existe la bitácora de esa moto para esa salida', 409);
  }

  return BitacoraMoto.create({
    salidaId: salida._id,
    motoId: datos.motoId,
    guiaId: salida.guiaId,
    fecha: datos.fecha,
    lavada: datos.lavada || false,
    revisada: datos.revisada || false,
    tanqueada: datos.tanqueada || false,
    conGasolina: datos.conGasolina || false,
    conAceite: datos.conAceite || false,
    observaciones: datos.observaciones || '',
    createdBy: usuario._id,
    updatedBy: usuario._id,
  });
}

export async function actualizarBitacora(id, datos, { usuario, guiaPropiaId }) {
  const registro = await BitacoraMoto.findById(id);
  if (!registro) throw new AppError('Registro de bitácora no encontrado', 404);

  if (usuario.rol === 'guia' && String(registro.guiaId) !== String(guiaPropiaId)) {
    throw new AppError('No tiene permisos para modificar este registro', 403);
  }

  const campos = ['lavada', 'revisada', 'tanqueada', 'conGasolina', 'conAceite'];
  for (const campo of campos) {
    if (datos[campo] !== undefined) registro[campo] = datos[campo];
  }
  if (datos.observaciones !== undefined && datos.observaciones !== null) {
    registro.observaciones = datos.observaciones;
  }
  if (datos.fecha) registro.fecha = datos.fecha;

  registro.updatedBy = usuario._id;
  await registro.save();
  return obtenerBitacora(id);
}
