import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { conectarDB, desconectarDB } from '../config/db.js';
import Usuario from '../models/Usuario.js';

/**
 * Crea el primer usuario administrador con los datos de .env:
 * ADMIN_NOMBRE, ADMIN_CORREO, ADMIN_PASSWORD
 * Uso: npm run seed:admin
 */
export async function seedAdmin() {
  const correo = (process.env.ADMIN_CORREO || '').toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD || '';
  const nombre = process.env.ADMIN_NOMBRE || 'Administrador';

  if (!correo || !password) {
    throw new Error('Define ADMIN_CORREO y ADMIN_PASSWORD en el archivo .env');
  }
  if (password.length < 8) {
    throw new Error('ADMIN_PASSWORD debe tener al menos 8 caracteres');
  }

  const existente = await Usuario.findOne({ correo });
  if (existente) {
    console.log(`[seed:admin] Ya existe un usuario con el correo ${correo}. No se modifica.`);
    return existente;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const admin = await Usuario.create({ nombre, correo, passwordHash, rol: 'admin', activo: true });
  console.log(`[seed:admin] Administrador creado: ${correo}`);
  return admin;
}

// Ejecución directa: npm run seed:admin
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    await conectarDB();
    await seedAdmin();
    await desconectarDB();
    process.exit(0);
  } catch (error) {
    console.error('[seed:admin] Error:', error.message);
    process.exit(1);
  }
}
