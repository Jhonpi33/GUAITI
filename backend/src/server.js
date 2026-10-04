import 'dotenv/config';
import app from './app.js';
import { conectarDB } from './config/db.js';

const PUERTO = process.env.PORT || 4000;

async function iniciar() {
  try {
    await conectarDB();
    app.listen(PUERTO, () => {
      console.log(`[server] API escuchando en http://localhost:${PUERTO}`);
      console.log(`[server] Health: http://localhost:${PUERTO}/api/v1/health`);
    });
  } catch (error) {
    console.error('[server] No fue posible iniciar el servidor:', error.message);
    process.exit(1);
  }
}

process.on('unhandledRejection', (err) => {
  console.error('[server] Promesa rechazada sin manejar:', err);
});

iniciar();
