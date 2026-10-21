import CascoCueva from '../models/CascoCueva.js';

/**
 * Semilla idempotente de los cascos de cueva (1 a 60).
 * Solo crea los que falten: se puede ejecutar cuantas veces se quiera
 * sin tocar cascos existentes ni sus estados.
 */
export async function seedCascos(desde = 1, hasta = 60) {
  const existentes = await CascoCueva.find({ numero: { $gte: desde, $lte: hasta } }).select('numero');
  const numeros = new Set(existentes.map((c) => c.numero));

  let creados = 0;
  for (let numero = desde; numero <= hasta; numero += 1) {
    if (numeros.has(numero)) continue;
    await CascoCueva.create({ numero, estado: 'disponible' });
    creados += 1;
  }

  console.log(`[seed] Cascos ${desde}-${hasta}: ${existentes.length} existentes, ${creados} creados`);
  return { creados };
}
