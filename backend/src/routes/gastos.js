import { Router } from 'express';
import * as gastoController from '../controllers/gastoController.js';
import { auth } from '../middlewares/auth.js';
import { permitirRoles } from '../middlewares/permitirRoles.js';
import { validar } from '../middlewares/validate.js';
import { subida } from '../middlewares/upload.js';
import { gastoSchema, editarGastoSchema, idSchema } from '../utils/schemas.js';

const router = Router();

router.get(
  '/',
  auth,
  permitirRoles('admin', 'secretario', 'guia'),
  gastoController.listar
);

router.post(
  '/',
  auth,
  permitirRoles('admin', 'secretario', 'guia'),
  subida.any(),
  validar(gastoSchema),
  gastoController.crear
);

router.put(
  '/:id',
  auth,
  permitirRoles('admin', 'secretario'),
  subida.any(),
  validar(idSchema, 'params'),
  validar(editarGastoSchema),
  gastoController.actualizar
);

router.delete(
  '/:id',
  auth,
  permitirRoles('admin'),
  validar(idSchema, 'params'),
  gastoController.eliminar
);

export default router;
