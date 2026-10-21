import { Router } from 'express';
import * as reporteDanioController from '../controllers/reporteDanioController.js';
import { auth } from '../middlewares/auth.js';
import { permitirRoles } from '../middlewares/permitirRoles.js';
import { resolverGuia } from '../middlewares/resolverGuia.js';
import { validar } from '../middlewares/validate.js';
import { subida } from '../middlewares/upload.js';
import {
  reporteDanioSchema,
  estadoReporteDanioSchema,
  idSchema,
} from '../utils/schemas.js';

const router = Router();

router.get(
  '/',
  auth,
  permitirRoles('admin', 'secretario', 'guia'),
  resolverGuia,
  reporteDanioController.listar
);

router.post(
  '/',
  auth,
  permitirRoles('admin', 'secretario', 'guia'),
  resolverGuia,
  subida.any(),
  validar(reporteDanioSchema),
  reporteDanioController.crear
);

router.patch(
  '/:id/estado',
  auth,
  permitirRoles('admin', 'secretario'),
  validar(idSchema, 'params'),
  validar(estadoReporteDanioSchema),
  reporteDanioController.cambiarEstado
);

export default router;
