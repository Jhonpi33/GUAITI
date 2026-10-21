import LiquidacionGuia from '../models/LiquidacionGuia.js';
import Salida from '../models/Salida.js';
import Adelanto from '../models/Adelanto.js';
import Guia from '../models/Guia.js';
import { AppError } from '../utils/asyncHandler.js';
import { datosPaginados } from '../utils/response.js';

const POBLAR = [
  { path: 'guiaId', select: 'nombre' },
  { path: 'salidas', select: 'fecha personas estado novedades', populate: { path: 'actividadId', select: 'nombre precioPorPersona' } },
  { path: 'adelantos', select: 'monto motivo fecha estado' },
];

function normalizarPeriodo(periodo) {
  const desde = new Date(periodo.desde);
  const hasta = new Date(periodo.hasta);
  if (Number.isNaN(desde.getTime()) || Number.isNaN(hasta.getTime())) {
    throw new AppError('El período de la liquidación no es válido', 400);
  }
  // Se incluye todo el día final
  const fin = new Date(hasta.getFullYear(), hasta.getMonth(), hasta.getDate(), 23, 59, 59, 999);
  if (desde > fin) throw new AppError('La fecha inicial del período no puede ser posterior a la final', 400);
  return { desde, hasta: fin };
}

export async function listarLiquidaciones({ rol, guiaPropiaId, guiaId, estado, desde, hasta, pagina, limite }) {
  const filtro = {};

  if (rol === 'guia') {
    if (guiaId && guiaId !== String(guiaPropiaId)) {
      throw new AppError('No tiene permisos para ver las liquidaciones de otro guía', 403);
    }
    filtro.guiaId = guiaPropiaId;
  } else if (guiaId) {
    filtro.guiaId = guiaId;
  }

  if (estado) filtro.estado = estado;
  if (desde || hasta) {
    // Se incluyen las liquidaciones cuyo período se cruza con el rango pedido
    if (desde) {
      const d = new Date(desde);
      if (Number.isNaN(d.getTime())) throw new AppError('La fecha inicial del período no es válida', 400);
      filtro['periodo.hasta'] = { $gte: d };
    }
    if (hasta) {
      const h = new Date(hasta);
      if (Number.isNaN(h.getTime())) throw new AppError('La fecha final del período no es válida', 400);
      const fin = new Date(h.getFullYear(), h.getMonth(), h.getDate(), 23, 59, 59, 999);
      filtro['periodo.desde'] = { $lte: fin };
    }
  }

  const [items, total] = await Promise.all([
    LiquidacionGuia.find(filtro)
      .populate(POBLAR)
      .sort({ createdAt: -1 })
      .skip((pagina - 1) * limite)
      .limit(limite),
    LiquidacionGuia.countDocuments(filtro),
  ]);

  return datosPaginados(items, total, pagina, limite);
}

/**
 * Arma la liquidación con todo el cálculo leído desde la base de datos:
 *   base = Σ (personas × actividad.precioPorPersona)
 *   total = base − adelantos aprobados − descuentos por pérdidas
 * Marca las salidas y adelantos como liquidados.
 */
export async function crearLiquidacion(datos, usuario) {
  const guia = await Guia.findById(datos.guiaId);
  if (!guia) throw new AppError('El guía indicado no existe', 404);

  const periodo = normalizarPeriodo(datos.periodo);

  // 1. Salidas candidatas: del guía, cerradas y sin liquidar, dentro del período
  const filtroSalidas = {
    guiaId: guia._id,
    estado: 'cerrada',
    liquidacionId: null,
    fecha: { $gte: periodo.desde, $lte: periodo.hasta },
  };
  let candidatas = await Salida.find(filtroSalidas).populate('actividadId', 'nombre precioPorPersona tipoRecurso');

  if (datos.salidasIds && datos.salidasIds.length > 0) {
    const pedidas = new Set(datos.salidasIds.map(String));
    const validas = candidatas.filter((s) => pedidas.has(String(s._id)));
    if (validas.length !== pedidas.size) {
      throw new AppError(
        'Una o más salidas seleccionadas no son válidas: deben ser del guía, estar cerradas, dentro del período y sin liquidar',
        400
      );
    }
    candidatas = validas;
  }

  if (candidatas.length === 0) {
    throw new AppError('No hay salidas cerradas sin liquidar para ese guía en ese período', 400);
  }

  // 2. Base desde la BD (jamás un precio del código)
  const base = candidatas.reduce((suma, salida) => {
    const precio = salida.actividadId?.precioPorPersona ?? 0;
    return suma + salida.personas * precio;
  }, 0);

  // 3. Adelantos aprobados sin liquidar
  const adelantos = await Adelanto.find({
    guiaId: guia._id,
    estado: 'aprobado',
    liquidacionId: null,
  });
  const adelantosDescontados = adelantos.reduce((suma, a) => suma + a.monto, 0);

  const descuentosPorPerdidas = datos.descuentosPorPerdidas || 0;
  const total = base - adelantosDescontados - descuentosPorPerdidas;
  if (total < 0) throw new AppError('El total no puede ser negativo', 400);

  const fechaPago = datos.fechaPago || null;

  // 4. Crear y marcar todo como liquidado
  const liquidacion = await LiquidacionGuia.create({
    guiaId: guia._id,
    periodo: { desde: periodo.desde, hasta: periodo.hasta },
    salidas: candidatas.map((s) => s._id),
    adelantos: adelantos.map((a) => a._id),
    adelantosDescontados,
    descuentosPorPerdidas,
    base,
    total,
    fechaPago,
    estado: fechaPago ? 'pagada' : 'pendiente',
    createdBy: usuario._id,
    updatedBy: usuario._id,
  });

  await Salida.updateMany(
    { _id: { $in: candidatas.map((s) => s._id) } },
    { $set: { liquidacionId: liquidacion._id, updatedBy: usuario._id } }
  );
  await Adelanto.updateMany(
    { _id: { $in: adelantos.map((a) => a._id) } },
    { $set: { estado: 'descontado', liquidacionId: liquidacion._id, updatedBy: usuario._id } }
  );

  return LiquidacionGuia.findById(liquidacion._id).populate(POBLAR);
}

export async function cambiarEstadoLiquidacion(id, datos, editorId) {
  const liquidacion = await LiquidacionGuia.findById(id);
  if (!liquidacion) throw new AppError('Liquidación no encontrada', 404);

  liquidacion.estado = datos.estado;
  if (datos.estado === 'pagada') {
    liquidacion.fechaPago = datos.fechaPago || new Date();
  } else {
    liquidacion.fechaPago = null;
  }

  liquidacion.updatedBy = editorId;
  await liquidacion.save();
  return LiquidacionGuia.findById(id).populate(POBLAR);
}

/**
 * Previsualización para armar la liquidación.
 */
export async function resumenPorGuia(guiaId, { rol, guiaPropiaId, desde, hasta }) {
  if (rol === 'guia' && String(guiaId) !== String(guiaPropiaId)) {
    throw new AppError('No tiene permisos para ver el resumen de otro guía', 403);
  }

  const guia = await Guia.findById(guiaId);
  if (!guia) throw new AppError('El guía indicado no existe', 404);

  const filtroSalidas = { guiaId: guia._id, estado: 'cerrada', liquidacionId: null };
  if (desde || hasta) {
    filtroSalidas.fecha = {};
    if (desde) filtroSalidas.fecha.$gte = new Date(desde);
    if (hasta) {
      const fin = new Date(hasta);
      filtroSalidas.fecha.$lte = new Date(fin.getFullYear(), fin.getMonth(), fin.getDate(), 23, 59, 59, 999);
    }
  }

  const salidas = await Salida.find(filtroSalidas)
    .populate('actividadId', 'nombre precioPorPersona')
    .sort({ fecha: 1 });

  const salidasPendientes = salidas.map((s) => ({
    _id: s._id,
    fecha: s.fecha,
    personas: s.personas,
    actividad: s.actividadId?.nombre || '',
    valor: s.personas * (s.actividadId?.precioPorPersona ?? 0),
  }));

  const adelantos = await Adelanto.find({
    guiaId: guia._id,
    estado: 'aprobado',
    liquidacionId: null,
  }).sort({ fecha: 1 });

  return {
    guia: { id: guia._id, nombre: guia.nombre },
    salidasPendientes,
    adelantosAprobados: adelantos.map((a) => ({
      _id: a._id,
      monto: a.monto,
      motivo: a.motivo,
      fecha: a.fecha,
    })),
    base: salidasPendientes.reduce((suma, s) => suma + s.valor, 0),
    adelantosDescontados: adelantos.reduce((suma, a) => suma + a.monto, 0),
  };
}
