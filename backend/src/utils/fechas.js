/**
 * Utilidades de fechas para los filtros por día (fecha=YYYY-MM-DD).
 */

/**
 * Convierte un valor 'YYYY-MM-DD', Date o string a un rango [inicio, fin]
 * del mismo día en la zona horaria del servidor.
 */
export function rangoDia(valor) {
  if (!valor) return null;
  const fecha = valor instanceof Date ? valor : new Date(`${valor}T00:00:00`);
  if (Number.isNaN(fecha.getTime())) return null;

  const inicio = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), 0, 0, 0, 0);
  const fin = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), 23, 59, 59, 999);
  return { inicio, fin };
}

/** Devuelve un Date normalizado a medianoche del día indicado. */
export function inicioDelDia(valor) {
  const rango = rangoDia(valor);
  return rango ? rango.inicio : null;
}
