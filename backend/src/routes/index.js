import { Router } from 'express';
import rutasAuth from './auth.js';
import rutasUsuarios from './usuarios.js';
import rutasGuias from './guias.js';
import rutasClientes from './clientes.js';
import rutasActividades from './actividades.js';
import rutasMotos from './motos.js';
import rutasParametros from './parametros.js';
import rutasTarifas from './tarifas.js';
import { responderOk } from '../utils/response.js';

const router = Router();

router.get('/health', (_req, res) => responderOk(res, { estado: 'ok' }, 'Servicio funcionando'));

router.use('/auth', rutasAuth);
router.use('/usuarios', rutasUsuarios);
router.use('/guias', rutasGuias);
router.use('/clientes', rutasClientes);
router.use('/actividades', rutasActividades);
router.use('/motos', rutasMotos);
router.use('/parametros', rutasParametros);
router.use('/tarifas-pago-guia', rutasTarifas);

export default router;
