import Gasto from '../models/Gasto.js';
import { AppError } from '../utils/asyncHandler.js';
import { datosPaginados } from '../utils/response.js';
import { rangoDia } from '../utils/fechas.js';

export async function listarGastos({ tipo, fechaDesde, fechaHasta, pagina, limite }) {
  const filtro = {};
  if (tipo) filtro.tipo = tipo;

  const inicio = rangoDia(fechaDesde);
  const fin = rangoDia(fechaHasta);
  if (inicio || fin) {
    filtro.fecha = {};
    if (inicio) filtro.fecha.$gte = inicio.inicio;
    if (fin) filtro.fecha.$lte = fin.fin;
  }

  const [items, total] = await Promise.all([
    Gasto.find(filtro)
      .populate('registradoPor', 'nombre correo')
      .sort({ fecha: -1, createdAt: -1 })
      .skip((pagina - 1) * limite)
      .limit(limite),
    Gasto.countDocuments(filtro),
  ]);

  return datosPaginados(items, total, pagina, limite);
}

export async function obtenerGasto(id) {
  const gasto = await Gasto.findById(id).populate('registradoPor', 'nombre correo');
  if (!gasto) throw new AppError('Gasto no encontrado', 404);
  return gasto;
}

export async function crearGasto(datos, usuario, fotoSoporte = '') {
  return Gasto.create({
    fecha: datos.fecha,
    tipo: datos.tipo,
    valor: datos.valor,
    descripcion: datos.descripcion || '',
    fotoSoporte,
    registradoPor: usuario._id,
    createdBy: usuario._id,
    updatedBy: usuario._id,
  });
}

export async function actualizarGasto(id, datos, editorId) {
  const gasto = await Gasto.findById(id);
  if (!gasto) throw new AppError('Gasto no encontrado', 404);

  if (datos.fecha !== undefined) gasto.fecha = datos.fecha;
  if (datos.tipo !== undefined) gasto.tipo = datos.tipo;
  if (datos.valor !== undefined) gasto.valor = datos.valor;
  if (datos.descripcion !== undefined && datos.descripcion !== null) {
    gasto.descripcion = datos.descripcion;
  }

  gasto.updatedBy = editorId;
  await gasto.save();
  return obtenerGasto(id);
}

export async function eliminarGasto(id) {
  const gasto = await Gasto.findById(id);
  if (!gasto) throw new AppError('Gasto no encontrado', 404);
  await Gasto.deleteOne({ _id: id });
  return { _id: gasto._id, eliminado: true };
}
