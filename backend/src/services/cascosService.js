import CascoCueva from '../models/CascoCueva.js';
import { AppError } from '../utils/asyncHandler.js';
import { datosPaginados } from '../utils/response.js';

export async function listarCascos({ estado = '', q = '', pagina, limite }) {
  const filtro = {};
  if (estado) filtro.estado = estado;
  if (q && !Number.isNaN(Number(q))) filtro.numero = Number(q);

  const [items, total] = await Promise.all([
    CascoCueva.find(filtro)
      .sort({ numero: 1 })
      .skip((pagina - 1) * limite)
      .limit(limite)
      .select('numero estado createdAt updatedAt'),
    CascoCueva.countDocuments(filtro),
  ]);

  return datosPaginados(items, total, pagina, limite);
}

export async function obtenerCasco(id) {
  const casco = await CascoCueva.findById(id);
  if (!casco) throw new AppError('Casco no encontrado', 404);
  return casco;
}

export async function crearCasco(datos, creadorId) {
  const existe = await CascoCueva.findOne({ numero: datos.numero });
  if (existe) throw new AppError(`Ya existe un casco con el número ${datos.numero}`, 409);

  return CascoCueva.create({
    numero: datos.numero,
    estado: datos.estado || 'disponible',
    createdBy: creadorId,
    updatedBy: creadorId,
  });
}

export async function actualizarCasco(id, datos, editorId) {
  const casco = await obtenerCasco(id);

  if (datos.numero !== undefined && datos.numero !== casco.numero) {
    const duplicado = await CascoCueva.findOne({ numero: datos.numero, _id: { $ne: id } });
    if (duplicado) throw new AppError(`Ya existe un casco con el número ${datos.numero}`, 409);
    casco.numero = datos.numero;
  }
  if (datos.estado !== undefined) casco.estado = datos.estado;

  casco.updatedBy = editorId;
  await casco.save();
  return casco;
}

export async function eliminarCasco(id) {
  const casco = await obtenerCasco(id);
  if (casco.estado !== 'disponible') {
    throw new AppError(
      `Solo se pueden eliminar cascos disponibles: el casco ${casco.numero} está en estado "${casco.estado}"`,
      400
    );
  }
  await CascoCueva.deleteOne({ _id: id });
  return { _id: casco._id, numero: casco.numero, eliminado: true };
}

/**
 * Crea los cascos del rango [desde, hasta] que falten (idempotente) y
 * elimina los que estén por encima de `hasta`, siempre que estén
 * `disponible`. Si `hasta < desde` solo se eliminan los de arriba.
 * Es lo mismo que usa la semilla (cascos 1 a 60).
 */
export async function ajustarRangoCascos({ desde, hasta }, editorId = null) {
  const resultado = { creados: [], actualizados: [], eliminados: [] };

  // 1. Crear los que falten en el rango pedido
  if (desde <= hasta) {
    const existentes = await CascoCueva.find({ numero: { $gte: desde, $lte: hasta } }).select('numero');
    const numerosExistentes = new Set(existentes.map((c) => c.numero));

    for (let numero = desde; numero <= hasta; numero += 1) {
      if (numerosExistentes.has(numero)) continue;
      const casco = await CascoCueva.create({
        numero,
        estado: 'disponible',
        createdBy: editorId,
        updatedBy: editorId,
      });
      resultado.creados.push(casco.numero);
    }
    resultado.actualizados = [...numerosExistentes].sort((a, b) => a - b);
  }

  // 2. Eliminar los que quedaron por encima de `hasta` (solo si están disponibles)
  const encima = await CascoCueva.find({ numero: { $gt: hasta } }).sort({ numero: 1 });
  const bloqueados = encima.filter((c) => c.estado !== 'disponible');
  if (bloqueados.length > 0) {
    const numeros = bloqueados.map((c) => c.numero).join(', ');
    throw new AppError(
      `No se puede acortar el rango: los cascos ${numeros} no están disponibles`,
      400
    );
  }
  if (encima.length > 0) {
    await CascoCueva.deleteMany({ _id: { $in: encima.map((c) => c._id) } });
    resultado.eliminados = encima.map((c) => c.numero);
  }

  return resultado;
}
