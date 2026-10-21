import { Router } from 'express';
import * as salidaController from '../controllers/salidaController.js';
import { auth } from '../middlewares/auth.js';
import { permitirRoles } from '../middlewares/permitirRoles.js';
import { resolverGuia } from '../middlewares/resolverGuia.js';
import { validar } from '../middlewares/validate.js';
import {
  crearSalidaSchema,
  estadoSalidaSchema,
  excepcionSalidaSchema,
  idSchema,
} from '../utils/schemas.js';

const router = Router();

router.get(
  '/',
  auth,
  permitirRoles('admin', 'secretario', 'guia'),
  resolverGuia,
  salidaController.listar
);

router.get(
  '/:id',
  auth,
  permitirRoles('admin', 'secretario', 'guia'),
  resolverGuia,
  validar(idSchema, 'params'),
  salidaController.obtener
);

router.post(
  '/',
  auth,
  permitirRoles('admin', 'guia'),
  resolverGuia,
  validar(crearSalidaSchema),
  salidaController.crear
);

router.patch(
  '/:id/estado',
  auth,
  permitirRoles('admin', 'guia'),
  resolverGuia,
  validar(idSchema, 'params'),
  validar(estadoSalidaSchema),
  salidaController.cambiarEstado
);

router.put(
  '/:id/excepcion',
  auth,
  permitirRoles('admin', 'secretario'),
  validar(idSchema, 'params'),
  validar(excepcionSalidaSchema),
  salidaController.autorizarExcepcion
);

export default router;
