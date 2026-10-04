import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rutas from './routes/index.js';
import { noEncontrado, manejadorDeErrores } from './middlewares/errorHandler.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || true }));
app.use(express.json({ limit: '2mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/', (_req, res) =>
  res.json({ ok: true, data: { servicio: 'Gua-iti API' }, message: 'API Gua-iti funcionando' })
);

app.use('/api/v1', rutas);

app.use(noEncontrado);
app.use(manejadorDeErrores);

export default app;
