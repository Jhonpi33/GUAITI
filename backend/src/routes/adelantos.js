import { Router } from 'express';
import * as adelantoController from '../controllers/adelantoController.js';
import { auth } from '../middlewares/auth.js';
import { permitirRoles } from '../middlewares/permitirRoles.js';
import { resolverGuia } from '../middlewares/resolverGuia.js';
import { validar } from '../middlewares/validate.js';
import { adelantoSchema, estadoAdelantoSchema, idSchema } from '../utils/schemas.js';

const router = Router();

router.get(
  '/',
  auth,
  permitirRoles('admin', 'secretario', 'guia'),
  resolverGuia,
  adelantoController.listar
);

router.post(
  '/',
  auth,
  permitirRoles('guia'),
  resolverGuia,
  validar(adelantoSchema),
  adelantoController.crear
);

router.patch(
  '/:id/estado',
  auth,
  permitirRoles('admin', 'secretario'),
  validar(idSchema, 'params'),
  validar(estadoAdelantoSchema),
  adelantoController.cambiarEstado
);

export default router;
