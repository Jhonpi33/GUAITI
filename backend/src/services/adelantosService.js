import Adelanto from '../models/Adelanto.js';
import { AppError } from '../utils/asyncHandler.js';
import { datosPaginados } from '../utils/response.js';

export async function listarAdelantos({ rol, guiaPropiaId, estado, guiaId, pagina, limite }) {
  const filtro = {};

  if (rol === 'guia') {
    if (guiaId && guiaId !== String(guiaPropiaId)) {
      throw new AppError('No tiene permisos para ver los adelantos de otro guía', 403);
    }
    filtro.guiaId = guiaPropiaId;
  } else if (guiaId) {
    filtro.guiaId = guiaId;
  }

  if (estado) filtro.estado = estado;

  const [items, total] = await Promise.all([
    Adelanto.find(filtro)
      .populate('guiaId', 'nombre')
      .populate('aprobadoPor', 'nombre correo')
      .sort({ fecha: -1, createdAt: -1 })
      .skip((pagina - 1) * limite)
      .limit(limite),
    Adelanto.countDocuments(filtro),
  ]);

  return datosPaginados(items, total, pagina, limite);
}

export async function obtenerAdelanto(id) {
  const adelanto = await Adelanto.findById(id)
    .populate('guiaId', 'nombre')
    .populate('aprobadoPor', 'nombre correo');
  if (!adelanto) throw new AppError('Adelanto no encontrado', 404);
  return adelanto;
}

/** El guía solicita su propio adelanto: el guiaId sale del token. */
export async function crearAdelanto(datos, { usuario, guiaPropiaId }) {
  return Adelanto.create({
    guiaId: guiaPropiaId,
    monto: datos.monto,
    motivo: datos.motivo,
    fecha: datos.fecha || new Date(),
    estado: 'solicitado',
    createdBy: usuario._id,
    updatedBy: usuario._id,
  });
}

export async function cambiarEstadoAdelanto(id, estado, editorId) {
  const adelanto = await obtenerAdelanto(id);

  if (adelanto.estado === 'descontado') {
    throw new AppError('El adelanto ya fue descontado en una liquidación', 400);
  }
  if (adelanto.estado !== 'solicitado') {
    throw new AppError(`El adelanto ya fue ${adelanto.estado}`, 400);
  }

  adelanto.estado = estado;
  if (estado === 'aprobado') adelanto.aprobadoPor = editorId;
  adelanto.updatedBy = editorId;
  await adelanto.save();
  return obtenerAdelanto(id);
}
