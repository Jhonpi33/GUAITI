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
