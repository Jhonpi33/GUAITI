/** Formatos de presentación (no modifican los valores guardados en la base de datos). */

const formatoMoneda = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

export function formatoCop(valor) {
  if (valor === null || valor === undefined || valor === '') return '—';
  const numero = Number(valor);
  if (Number.isNaN(numero)) return '—';
  return formatoMoneda.format(numero);
}

export function formatoDuracion(minutos) {
  if (minutos === null || minutos === undefined || minutos === '') return '—';
  return `${minutos} min`;
}

/** Fecha legible en español: 4 oct 2026 */
export function formatoFecha(fecha) {
  if (!fecha) return '—';
  const objeto = new Date(fecha);
  if (Number.isNaN(objeto.getTime())) return '—';
  return new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }).format(objeto);
}

/** Fecha y hora cortas: 4 oct 2026 · 08:30 */
export function formatoFechaHora(fecha) {
  if (!fecha) return '—';
  const objeto = new Date(fecha);
  if (Number.isNaN(objeto.getTime())) return '—';
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(objeto);
}

/** Hoy en formato AAAA-MM-DD (para inputs type="date"). */
export function hoyISO() {
  const ahora = new Date();
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const dia = String(ahora.getDate()).padStart(2, '0');
  return `${ahora.getFullYear()}-${mes}-${dia}`;
}
