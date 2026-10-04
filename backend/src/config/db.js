import 'dotenv/config';
import mongoose from 'mongoose';

/**
 * Conecta a MongoDB Atlas (o local) usando la variable MONGODB_URI.
 */
export async function conectarDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Falta la variable de entorno MONGODB_URI en el archivo .env');
  }

  mongoose.set('strictQuery', true);

  mongoose.connection.on('connected', () => {
    console.log(`[db] Conectado a MongoDB: ${mongoose.connection.name}`);
  });
  mongoose.connection.on('error', (err) => {
    console.error('[db] Error de conexión:', err.message);
  });

  await mongoose.connect(uri);
  return mongoose.connection;
}

export async function desconectarDB() {
  await mongoose.disconnect();
}
