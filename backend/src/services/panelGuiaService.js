import Salida from '../models/Salida.js';
import Adelanto from '../models/Adelanto.js';
import LiquidacionGuia from '../models/LiquidacionGuia.js';
import CascoCueva from '../models/CascoCueva.js';
import { rangoDia } from '../utils/fechas.js';

const POBLAR = [
  { path: 'actividadId', select: 'nombre precioPorPersona tipoRecurso' },
  { path: 'motos', select: 'nombre estado' },
  { path: 'cascos', select: 'numero estado' },
];

function aYYYYMMDD(fecha) {
  const f = fecha;
  const dia = String(f.getDate()).padStart(2, '0');
  const mes = String(f.getMonth() + 1).padStart(2, '0');
  return `${f.getFullYear()}-${mes}-${dia}`;
}

/**
 * Resumen del panel del guía para un día.
 */
export async function obtenerPanel({ fecha, guia }) {
  const dia = fecha || new Date();
  const rango = rangoDia(dia);
  const inicio = rango ? rango.inicio : new Date();
  const fin = rango ? rango.fin : new Date();

  const [salidas, adelantosPendientes, liquidacionesPendientes, cascosPendientes] = await Promise.all([
    Salida.find({ guiaId: guia._id, fecha: { $gte: inicio, $lte: fin } })
      .populate(POBLAR)
      .sort({ createdAt: 1 }),

    // Lo que se le debe descontar: adelantos aprobados y aún no liquidados
    Adelanto.aggregate([
      {
        $match: {
          guiaId: guia._id,
          estado: 'aprobado',
          liquidacionId: null,
        },
      },
      { $group: { _id: null, total: { $sum: '$monto' } } },
    ]),

    // Liquidaciones armadas y todavía no pagadas al guía
    LiquidacionGuia.aggregate([
      { $match: { guiaId: guia._id, estado: 'pendiente' } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),

    // Cascos que quedaron pendientes de lavar
    CascoCueva.countDocuments({ estado: 'por_lavar' }),
  ]);

  return {
    fecha: aYYYYMMDD(inicio),
    guia: { id: guia._id, nombre: guia.nombre },
    salidas,
    totalAdelantosPendientes: adelantosPendientes[0]?.total || 0,
    totalLiquidacionesPendientes: liquidacionesPendientes[0]?.total || 0,
    cascosPendientes,
  };
}
