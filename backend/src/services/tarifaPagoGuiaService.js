import TarifaPagoGuia from '../models/TarifaPagoGuia.js';
import Actividad from '../models/Actividad.js';
import { AppError } from '../utils/asyncHandler.js';
import { datosPaginados } from '../utils/response.js';

export async function listarTarifas({ q = '', pagina, limite, actividadId = '', unidad = '' }) {
  const filtro = {};
  if (actividadId) filtro.actividadId = actividadId;
  if (unidad) filtro.unidad = unidad;

  const [items, total] = await Promise.all([
    TarifaPagoGuia.find(filtro)
      .populate('actividadId', 'nombre tipoRecurso')
      .sort({ actividadId: 1, unidad: 1, desde: 1 })
      .skip((pagina - 1) * limite)
      .limit(limite),
    TarifaPagoGuia.countDocuments(filtro),
  ]);

  return datosPaginados(items, total, pagina, limite);
}

export async function obtenerTarifa(id) {
  const tarifa = await TarifaPagoGuia.findById(id).populate('actividadId', 'nombre tipoRecurso');
  if (!tarifa) throw new AppError('Tarifa no encontrada', 404);
  return tarifa;
}

export async function crearTarifa(datos, creadorId) {
  const actividad = await Actividad.findById(datos.actividadId);
  if (!actividad) throw new AppError('La actividad indicada no existe', 404);

  if (datos.hasta != null && datos.desde > datos.hasta) {
    throw new AppError("El rango 'desde' no puede ser mayor que 'hasta'", 400);
  }

  return TarifaPagoGuia.create({ ...datos, createdBy: creadorId, updatedBy: creadorId });
}

export async function actualizarTarifa(id, datos, editorId) {
  const tarifa = await TarifaPagoGuia.findById(id);
  if (!tarifa) throw new AppError('Tarifa no encontrada', 404);

  const desde = datos.desde ?? tarifa.desde;
  const hasta = datos.hasta !== undefined ? datos.hasta : tarifa.hasta;
  if (hasta != null && desde > hasta) {
    throw new AppError("El rango 'desde' no puede ser mayor que 'hasta'", 400);
  }

  if (datos.actividadId) {
    const actividad = await Actividad.findById(datos.actividadId);
    if (!actividad) throw new AppError('La actividad indicada no existe', 404);
    tarifa.actividadId = datos.actividadId;
  }

  Object.assign(tarifa, datos, { desde, hasta });
  tarifa.updatedBy = editorId;
  await tarifa.save();
  return obtenerTarifa(tarifa._id);
}

export async function eliminarTarifa(id) {
  const tarifa = await TarifaPagoGuia.findByIdAndDelete(id);
  if (!tarifa) throw new AppError('Tarifa no encontrada', 404);
  return tarifa;
}

/**
 * Devuelve la tarifa vigente para una actividad y una cantidad de unidades.
 * Nunca hay precios en el código: todo sale de la colección tarifasPagoGuia.
 */
export async function tarifaVigente(actividadId, cantidad) {
  const tarifas = await TarifaPagoGuia.find({ actividadId, activa: true }).sort({ desde: 1 });
  const vigente = tarifas.find((t) => cantidad >= t.desde && (t.hasta == null || cantidad <= t.hasta));
  return vigente || null;
}
