import { Router } from 'express';
import * as bitacoraController from '../controllers/bitacoraController.js';
import { auth } from '../middlewares/auth.js';
import { permitirRoles } from '../middlewares/permitirRoles.js';
import { resolverGuia } from '../middlewares/resolverGuia.js';
import { validar } from '../middlewares/validate.js';
import { bitacoraSchema, editarBitacoraSchema, idSchema } from '../utils/schemas.js';

const router = Router();

router.get(
  '/',
  auth,
  permitirRoles('admin', 'secretario', 'guia'),
  resolverGuia,
  bitacoraController.listar
);

router.post(
  '/',
  auth,
  permitirRoles('admin', 'secretario', 'guia'),
  resolverGuia,
  validar(bitacoraSchema),
  bitacoraController.crear
);

router.put(
  '/:id',
  auth,
  permitirRoles('admin', 'secretario', 'guia'),
  resolverGuia,
  validar(idSchema, 'params'),
  validar(editarBitacoraSchema),
  bitacoraController.actualizar
);

export default router;
