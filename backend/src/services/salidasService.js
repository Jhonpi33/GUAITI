import Salida from '../models/Salida.js';
import Actividad from '../models/Actividad.js';
import Moto from '../models/Moto.js';
import CascoCueva from '../models/CascoCueva.js';
import Guia from '../models/Guia.js';
import { AppError } from '../utils/asyncHandler.js';
import { datosPaginados } from '../utils/response.js';
import { rangoDia } from '../utils/fechas.js';
import { obtenerParametrosComoMapa } from './parametroService.js';

const POBLAR = [
  { path: 'actividadId', select: 'nombre precioPorPersona tipoRecurso' },
  { path: 'motos', select: 'nombre estado' },
  { path: 'cascos', select: 'numero estado' },
  { path: 'guiaId', select: 'nombre' },
];

/** Parámetros de negocio que viven en la colección `parametros`. */
async function parametrosDeNegocio() {
  const mapa = await obtenerParametrosComoMapa();

  const maxMotosPorGuia = Number(mapa.maxMotosPorGuia);
  if (!Number.isFinite(maxMotosPorGuia)) {
    throw new AppError('El parámetro "maxMotosPorGuia" no está configurado', 400);
  }
  const maxPersonasPorMoto = Number(mapa.maxPersonasPorMoto);
  if (!Number.isFinite(maxPersonasPorMoto)) {
    throw new AppError('El parámetro "maxPersonasPorMoto" no está configurado', 400);
  }

  return { maxMotosPorGuia, maxPersonasPorMoto };
}

async function poblarSalida(salida) {
  return Salida.populate(salida, POBLAR);
}

/* ------------------------------ Lectura ------------------------------ */

export async function listarSalidas({ rol, guiaPropiaId, fecha, guiaId, estado, pagina, limite }) {
  const filtro = {};

  if (rol === 'guia') {
    if (guiaId && guiaId !== String(guiaPropiaId)) {
      throw new AppError('No tiene permisos para ver las salidas de otro guía', 403);
    }
    filtro.guiaId = guiaPropiaId;
  } else if (guiaId) {
    filtro.guiaId = guiaId;
  }

  if (estado) filtro.estado = estado;
  const rango = rangoDia(fecha);
  if (rango) filtro.fecha = { $gte: rango.inicio, $lte: rango.fin };

  const [items, total] = await Promise.all([
    Salida.find(filtro)
      .populate(POBLAR)
      .sort({ fecha: -1, createdAt: -1 })
      .skip((pagina - 1) * limite)
      .limit(limite),
    Salida.countDocuments(filtro),
  ]);

  return datosPaginados(items, total, pagina, limite);
}

export async function obtenerSalida(id, { rol, guiaPropiaId } = {}) {
  const salida = await Salida.findById(id).populate(POBLAR);
  if (!salida) throw new AppError('Salida no encontrada', 404);

  if (rol === 'guia' && String(salida.guiaId?._id || salida.guiaId) !== String(guiaPropiaId)) {
    throw new AppError('No tiene permisos para ver esta salida', 403);
  }
  return salida;
}

/* ------------------------------ Creación ------------------------------ */

export async function crearSalida(datos, { usuario, guiaPropiaId }) {
  const rol = usuario.rol;

  // 1. Guía de la salida
  let guiaId;
  if (rol === 'guia') {
    guiaId = guiaPropiaId;
  } else {
    if (!datos.guiaId) throw new AppError('Debe indicar el guía de la salida', 400);
    const guia = await Guia.findById(datos.guiaId);
    if (!guia) throw new AppError('El guía indicado no existe', 404);
    guiaId = guia._id;
  }

  // 2. Actividad existente y activa
  const actividad = await Actividad.findById(datos.actividadId);
  if (!actividad) throw new AppError('La actividad no existe', 404);
  if (!actividad.activa) throw new AppError('La actividad está inactiva y no puede tener salidas', 400);

  const motosIds = [...new Set((datos.motos || []).map(String))];
  const cascosIds = [...new Set((datos.cascos || []).map(String))];

  // 3. Recursos según el tipo de actividad
  if (actividad.tipoRecurso === 'moto' && motosIds.length === 0) {
    throw new AppError('Esta salida requiere al menos una moto', 400);
  }
  if (actividad.tipoRecurso === 'cupo' && cascosIds.length === 0) {
    throw new AppError('Esta salida requiere al menos un casco', 400);
  }

  // 4. Las motos deben existir y estar disponibles
  const motos = await Moto.find({ _id: { $in: motosIds } });
  if (motos.length !== motosIds.length) {
    const encontradas = new Set(motos.map((m) => String(m._id)));
    throw new AppError('Una o más motos no existen', 404);
  }
  for (const moto of motos) {
    if (moto.estado === 'mantenimiento') {
      throw new AppError(`La moto "${moto.nombre}" está en mantenimiento y no puede salir`, 400);
    }
    if (moto.estado !== 'disponible') {
      throw new AppError(`La moto "${moto.nombre}" no está disponible y no puede salir`, 400);
    }
  }

  // 5. Los cascos deben existir y estar disponibles
  const cascos = await CascoCueva.find({ _id: { $in: cascosIds } });
  if (cascos.length !== cascosIds.length) {
    throw new AppError('Uno o más cascos no existen', 404);
  }
  for (const casco of cascos) {
    // "por_lavar" sigue en circulación (se reasigna y se lava después);
    // en_uso, dañado o perdido no pueden salir.
    if (casco.estado !== 'disponible' && casco.estado !== 'por_lavar') {
      throw new AppError(
        `El casco ${casco.numero} no está disponible (estado "${casco.estado}")`,
        400
      );
    }
  }

  // 6. Ninguna moto/casco puede estar en otra salida abierta o en curso
  const condiciones = [];
  if (motosIds.length) condiciones.push({ motos: { $in: motosIds } });
  if (cascosIds.length) condiciones.push({ cascos: { $in: cascosIds } });

  if (condiciones.length) {
    const enCurso = await Salida.find({
      estado: { $in: ['abierta', 'en_curso'] },
      $or: condiciones,
    }).populate('motos', 'nombre').populate('cascos', 'numero');

    for (const salidaAbierta of enCurso) {
      for (const moto of salidaAbierta.motos || []) {
        if (motosIds.includes(String(moto._id))) {
          throw new AppError(`La moto "${moto.nombre}" ya está en una salida abierta`, 409);
        }
      }
      for (const casco of salidaAbierta.cascos || []) {
        if (cascosIds.includes(String(casco._id))) {
          throw new AppError(`El casco ${casco.numero} ya está en una salida abierta`, 409);
        }
      }
    }
  }

  // 7. Límites de personas y de motos (siempre desde la BD)
  const { maxMotosPorGuia, maxPersonasPorMoto } = await parametrosDeNegocio();

  if (actividad.tipoRecurso === 'moto') {
    const maxPersonas = motosIds.length * maxPersonasPorMoto;
    if (datos.personas > maxPersonas) {
      throw new AppError(
        `Con ${motosIds.length} motos solo pueden ir ${maxPersonas} personas`,
        400
      );
    }

    if (motosIds.length > maxMotosPorGuia) {
      if (datos.excepcionMotos === true) {
        if (rol !== 'admin' && rol !== 'secretario') {
          throw new AppError(
            'Solo el administrador o el secretario pueden autorizar la excepción de motos',
            403
          );
        }
      } else {
        throw new AppError(
          `Máximo ${maxMotosPorGuia} motos por guía. Pida autorización al administrador`,
          400
        );
      }
    }
  }

  // 8. Crear la salida y pasar los cascos a "en_uso"
  const salida = await Salida.create({
    guiaId,
    fecha: datos.fecha,
    actividadId: actividad._id,
    personas: datos.personas,
    motos: motos.map((m) => m._id),
    cascos: cascos.map((c) => c._id),
    estado: 'abierta',
    novedades: datos.novedades || '',
    excepcionMotos: motosIds.length > maxMotosPorGuia && datos.excepcionMotos === true,
    createdBy: usuario._id,
    updatedBy: usuario._id,
  });

  if (cascosIds.length) {
    await CascoCueva.updateMany(
      { _id: { $in: cascos.map((c) => c._id) } },
      { $set: { estado: 'en_uso', updatedBy: usuario._id } }
    );
  }

  return poblarSalida(salida);
}

/* --------------------------- Cambio de estado -------------------------- */

export async function cambiarEstadoSalida(id, datos, { usuario, guiaPropiaId }) {
  const salida = await Salida.findById(id);
  if (!salida) throw new AppError('Salida no encontrada', 404);

  if (usuario.rol === 'guia' && String(salida.guiaId) !== String(guiaPropiaId)) {
    throw new AppError('No tiene permisos para modificar esta salida', 403);
  }
  if (salida.estado === 'cerrada') {
    throw new AppError('La salida ya está cerrada', 400);
  }

  salida.updatedBy = usuario._id;
  if (datos.novedades !== undefined && datos.novedades !== null) {
    salida.novedades = datos.novedades;
  }

  if (datos.estado === 'en_curso') {
    salida.estado = 'en_curso';
    await salida.save();
    return poblarSalida(salida);
  }

  // Cerrar la salida
  const cascosEstado = datos.cascosEstado || [];
  const cascosDeLaSalida = await CascoCueva.find({ _id: { $in: salida.cascos || [] } });

  const estadosPorCasco = new Map();
  for (const item of cascosEstado) {
    const casco = cascosDeLaSalida.find((c) => String(c._id) === String(item.cascoId));
    if (!casco) {
      throw new AppError('Uno de los cascos indicados no pertenece a esta salida', 400);
    }
    estadosPorCasco.set(String(casco._id), item.estado);
  }

  // Los cascos no marcados vuelven a "disponible"
  for (const casco of cascosDeLaSalida) {
    const estadoFinal = estadosPorCasco.get(String(casco._id)) || 'disponible';
    if (casco.estado !== estadoFinal) {
      casco.estado = estadoFinal;
      casco.updatedBy = usuario._id;
      await casco.save();
    }
  }

  salida.estado = 'cerrada';
  await salida.save();
  return poblarSalida(salida);
}

/* ------------------------- Excepción de motos -------------------------- */

export async function autorizarExcepcion(id, editorId) {
  const salida = await Salida.findById(id);
  if (!salida) throw new AppError('Salida no encontrada', 404);

  salida.excepcionMotos = true;
  salida.updatedBy = editorId;
  await salida.save();
  return poblarSalida(salida);
}
