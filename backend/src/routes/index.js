import { Router } from 'express';
import rutasAuth from './auth.js';
import rutasUsuarios from './usuarios.js';
import rutasGuias from './guias.js';
import rutasClientes from './clientes.js';
import rutasActividades from './actividades.js';
import rutasMotos from './motos.js';
import rutasParametros from './parametros.js';
import rutasTarifas from './tarifas.js';
import rutasPanelGuia from './panelGuia.js';
import rutasCascos from './cascos.js';
import rutasSalidas from './salidas.js';
import rutasAdelantos from './adelantos.js';
import rutasBitacora from './bitacora.js';
import rutasUploads from './uploads.js';
import rutasReportesDanio from './reportesDanio.js';
import rutasGastos from './gastos.js';
import rutasLiquidaciones from './liquidaciones.js';
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
router.use('/panel-guia', rutasPanelGuia);
router.use('/cascos', rutasCascos);
router.use('/salidas', rutasSalidas);
router.use('/adelantos', rutasAdelantos);
router.use('/bitacora', rutasBitacora);
router.use('/uploads', rutasUploads);
router.use('/reportes-danio', rutasReportesDanio);
router.use('/gastos', rutasGastos);
router.use('/liquidaciones', rutasLiquidaciones);

export default router;
