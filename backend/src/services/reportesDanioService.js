import ReporteDanio from '../models/ReporteDanio.js';
import Moto from '../models/Moto.js';
import { AppError } from '../utils/asyncHandler.js';
import { datosPaginados } from '../utils/response.js';
import { rangoDia } from '../utils/fechas.js';

const POBLAR = [
  { path: 'motoId', select: 'nombre estado' },
  { path: 'guiaId', select: 'nombre' },
];

export async function listarReportes({ rol, guiaPropiaId, estado, motoId, guiaId, fecha, pagina, limite }) {
  const filtro = {};

  if (rol === 'guia') {
    if (guiaId && guiaId !== String(guiaPropiaId)) {
      throw new AppError('No tiene permisos para ver los reportes de otro guía', 403);
    }
    filtro.guiaId = guiaPropiaId;
  } else if (guiaId) {
    filtro.guiaId = guiaId;
  }

  if (estado) filtro.estado = estado;
  if (motoId) filtro.motoId = motoId;
  const rango = rangoDia(fecha);
  if (rango) filtro.fecha = { $gte: rango.inicio, $lte: rango.fin };

  const [items, total] = await Promise.all([
    ReporteDanio.find(filtro)
      .populate(POBLAR)
      .sort({ fecha: -1, createdAt: -1 })
      .skip((pagina - 1) * limite)
      .limit(limite),
    ReporteDanio.countDocuments(filtro),
  ]);

  return datosPaginados(items, total, pagina, limite);
}

/**
 * Crea el reporte. Si la gravedad es "grave" y hay moto asociada,
 * la moto pasa a estado "mantenimiento".
 */
export async function crearReporte(datos, { usuario, guiaPropiaId, fotos = [] }) {
  let guiaId;

  if (usuario.rol === 'guia') {
    guiaId = guiaPropiaId;
  } else {
    // admin/secretario deben indicar a qué guía pertenece el reporte
    if (!datos.guiaId) throw new AppError('Debe indicar el guía responsable del reporte', 400);
    guiaId = datos.guiaId;
  }

  let motoEnMantenimiento = false;
  if (datos.motoId) {
    const moto = await Moto.findById(datos.motoId);
    if (!moto) throw new AppError('La moto indicada no existe', 404);

    if (datos.gravedad === 'grave') {
      moto.estado = 'mantenimiento';
      moto.updatedBy = usuario._id;
      await moto.save();
      motoEnMantenimiento = true;
    }
  }

  const reporte = await ReporteDanio.create({
    fecha: datos.fecha,
    motoId: datos.motoId || null,
    equipo: datos.equipo || '',
    guiaId,
    descripcion: datos.descripcion,
    fotos,
    gravedad: datos.gravedad || 'leve',
    estado: 'reportado',
    createdBy: usuario._id,
    updatedBy: usuario._id,
  });

  const poblado = await ReporteDanio.findById(reporte._id).populate(POBLAR);
  return { ...poblado.toObject(), motoEnMantenimiento };
}

export async function cambiarEstadoReporte(id, estado, editorId) {
  const reporte = await ReporteDanio.findById(id);
  if (!reporte) throw new AppError('Reporte de daño no encontrado', 404);

  reporte.estado = estado;
  reporte.updatedBy = editorId;
  await reporte.save();

  // Al resolverse el daño, la moto vuelve a estar disponible
  if (estado === 'resuelto' && reporte.motoId) {
    await Moto.updateOne(
      { _id: reporte.motoId, estado: 'mantenimiento' },
      { $set: { estado: 'disponible', updatedBy: editorId } }
    );
  }

  return ReporteDanio.findById(id).populate(POBLAR);
}
