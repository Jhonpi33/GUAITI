import 'dotenv/config';
import { conectarDB, desconectarDB } from '../config/db.js';
import { seedAdmin } from './seedAdmin.js';
import Guia from '../models/Guia.js';
import Actividad from '../models/Actividad.js';
import Moto from '../models/Moto.js';
import Parametro from '../models/Parametro.js';
import TarifaPagoGuia from '../models/TarifaPagoGuia.js';

/* Los valores de este archivo SOLO se cargan una vez en la base de datos.
   El sistema nunca los lee del código: siempre consulta las colecciones
   actividades, parametros y tarifasPagoGuia. */

const GUIAS = [
  { nombre: 'Juan Diego', telefono: '' },
  { nombre: 'Jhon', telefono: '' },
  { nombre: 'Santiago', telefono: '' },
];

const ACTIVIDADES = [
  {
    nombre: 'Cueva de la Vaca',
    descripcion: 'Recorrido turístico por la Cueva de la Vaca en San Gil.',
    precioPorPersona: 50000,
    duracionMin: null,
    tipoRecurso: 'cupo',
    activa: true,
  },
  {
    nombre: 'Cueva del Yeso',
    descripcion: 'Recorrido turístico por la Cueva del Yeso en San Gil.',
    precioPorPersona: 80000,
    duracionMin: null,
    tipoRecurso: 'cupo',
    activa: true,
  },
  {
    nombre: 'Cuatrimotos 1 hora',
    descripcion: 'Recorrido en cuatrimoto de 1 hora.',
    precioPorPersona: 0,
    duracionMin: 60,
    tipoRecurso: 'moto',
    activa: true,
  },
  {
    nombre: 'Cuatrimotos 2 horas',
    descripcion: 'Recorrido en cuatrimoto de 2 horas.',
    precioPorPersona: 0,
    duracionMin: 120,
    tipoRecurso: 'moto',
    activa: true,
  },
];

const MOTOS = [
  'Kymco azul',
  'Kymco roja vieja',
  'Kymco blanca',
  'Kymco negra con cortavientos',
  'Kawa verde con blanco',
  'Kawa roja con blanco',
  'Roja nueva',
  'Honda',
  'Kymco negra sin porta cortavientos',
];

const PARAMETROS = [
  { clave: 'maxMotosPorGuia', valor: 4, descripcion: 'Máximo de motos por guía en una salida' },
  { clave: 'maxPersonasPorMoto', valor: 2, descripcion: 'Máximo de personas por moto' },
  { clave: 'minutosCharla', valor: 30, descripcion: 'Minutos de charla previa a la salida' },
  { clave: 'minutosDescuentoTarde', valor: 10, descripcion: 'Minutos de tolerancia antes de descontar por llegada tarde' },
  { clave: 'temporadaAlta', valor: false, descripcion: 'Indicador de temporada alta' },
  { clave: 'horaApertura', valor: '08:00', descripcion: 'Hora de apertura del servicio' },
  { clave: 'horaCierre', valor: '16:00', descripcion: 'Hora de cierre del servicio' },
];

// Tarifas por defecto. El sistema siempre las lee de la colección tarifasPagoGuia.
const TARIFAS = {
  cuevas: [
    { desde: 1, hasta: 1, valor: 10000 },
    { desde: 2, hasta: null, valor: 7000 },
  ],
  motos: [
    { desde: 1, hasta: 1, valor: 10000 },
    { desde: 2, hasta: null, valor: 8000 },
  ],
};

export async function seedDatos() {
  // Guías
  for (const g of GUIAS) {
    await Guia.updateOne({ nombre: g.nombre }, { $setOnInsert: { ...g, activo: true } }, { upsert: true });
  }
  console.log(`[seed] Guías verificados: ${GUIAS.map((g) => g.nombre).join(', ')}`);

  // Actividades
  for (const a of ACTIVIDADES) {
    await Actividad.updateOne({ nombre: a.nombre }, { $setOnInsert: a }, { upsert: true });
  }
  console.log(`[seed] Actividades verificadas: ${ACTIVIDADES.length}`);

  // Motos
  for (const nombre of MOTOS) {
    await Moto.updateOne({ nombre }, { $setOnInsert: { nombre, estado: 'disponible', notas: '' } }, { upsert: true });
  }
  console.log(`[seed] Motos verificadas: ${MOTOS.length}`);

  // Parámetros
  for (const p of PARAMETROS) {
    await Parametro.updateOne({ clave: p.clave }, { $setOnInsert: p }, { upsert: true });
  }
  console.log(`[seed] Parámetros verificados: ${PARAMETROS.length}`);

  // Tarifas de pago al guía (por actividad)
  const cuevas = await Actividad.find({ nombre: { $in: ['Cueva de la Vaca', 'Cueva del Yeso'] } });
  const motos = await Actividad.find({ nombre: { $in: ['Cuatrimotos 1 hora', 'Cuatrimotos 2 horas'] } });

  let tarifasCreadas = 0;
  for (const actividad of [...cuevas, ...motos]) {
    const grupo = cuevas.includes(actividad) ? TARIFAS.cuevas : TARIFAS.motos;
    const unidad = cuevas.includes(actividad) ? 'persona' : 'moto';
    for (const t of grupo) {
      const r = await TarifaPagoGuia.updateOne(
        { actividadId: actividad._id, unidad, desde: t.desde },
        { $setOnInsert: { actividadId: actividad._id, unidad, desde: t.desde, hasta: t.hasta, valor: t.valor, activa: true } },
        { upsert: true }
      );
      tarifasCreadas += r.upsertedCount || 0;
    }
  }
  console.log(`[seed] Tarifas de pago al guía: ${tarifasCreadas} nuevas`);
}

async function main() {
  await conectarDB();
  await seedAdmin();
  await seedDatos();
  await desconectarDB();
  console.log('[seed] Semilla completada.');
  process.exit(0);
}

main().catch((error) => {
  console.error('[seed] Error:', error.message);
  process.exit(1);
});
