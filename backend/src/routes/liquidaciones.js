import { Router } from 'express';
import * as liquidacionController from '../controllers/liquidacionController.js';
import { auth } from '../middlewares/auth.js';
import { permitirRoles } from '../middlewares/permitirRoles.js';
import { resolverGuia } from '../middlewares/resolverGuia.js';
import { validar } from '../middlewares/validate.js';
import {
  liquidacionSchema,
  estadoLiquidacionSchema,
  idSchema,
  guiaIdSchema,
} from '../utils/schemas.js';

const router = Router();

router.get(
  '/',
  auth,
  permitirRoles('admin', 'secretario', 'guia'),
  resolverGuia,
  liquidacionController.listar
);

// El resumen se monta antes de las rutas con :id
router.get(
  '/resumen/:guiaId',
  auth,
  permitirRoles('admin', 'secretario', 'guia'),
  resolverGuia,
  validar(guiaIdSchema, 'params'),
  liquidacionController.resumen
);

router.post(
  '/',
  auth,
  permitirRoles('admin', 'secretario'),
  validar(liquidacionSchema),
  liquidacionController.crear
);

router.patch(
  '/:id/estado',
  auth,
  permitirRoles('admin', 'secretario'),
  validar(idSchema, 'params'),
  validar(estadoLiquidacionSchema),
  liquidacionController.cambiarEstado
);

export default router;
