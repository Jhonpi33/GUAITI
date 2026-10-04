import Parametro from '../models/Parametro.js';
import { AppError } from '../utils/asyncHandler.js';
import { datosPaginados } from '../utils/response.js';

export async function listarParametros({ q = '', pagina, limite }) {
  const filtro = {};
  if (q) {
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filtro.$or = [{ clave: regex }, { descripcion: regex }];
  }

  const [items, total] = await Promise.all([
    Parametro.find(filtro)
      .sort({ clave: 1 })
      .skip((pagina - 1) * limite)
      .limit(limite),
    Parametro.countDocuments(filtro),
  ]);

  return datosPaginados(items, total, pagina, limite);
}

/**
 * Devuelve todos los parámetros como un objeto { clave: valor }.
 * Es lo que consume el resto del sistema: nunca se guardan en el código.
 */
export async function obtenerParametrosComoMapa() {
  const parametros = await Parametro.find();
  return parametros.reduce((acc, p) => {
    acc[p.clave] = p.valor;
    return acc;
  }, {});
}

export async function obtenerParametro(clave) {
  const parametro = await Parametro.findOne({ clave });
  if (!parametro) throw new AppError(`Parámetro "${clave}" no encontrado`, 404);
  return parametro;
}

export async function editarParametro(clave, datos, editorId) {
  const parametro = await Parametro.findOne({ clave });
  if (!parametro) throw new AppError(`Parámetro "${clave}" no encontrado`, 404);

  parametro.valor = datos.valor;
  if (datos.descripcion !== undefined) parametro.descripcion = datos.descripcion;
  parametro.updatedBy = editorId;
  await parametro.save();
  return parametro;
}
