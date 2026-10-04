import { Router } from 'express';
import * as motoController from '../controllers/motoController.js';
import { auth } from '../middlewares/auth.js';
import { permitirRoles } from '../middlewares/permitirRoles.js';
import { validar } from '../middlewares/validate.js';
import { motoSchema, estadoMotoSchema, idSchema } from '../utils/schemas.js';

const router = Router();

// Lectura amplia: el guía también necesita ver las motos
router.get('/', auth, permitirRoles('admin', 'secretario', 'guia'), motoController.listar);
router.get('/:id', auth, permitirRoles('admin', 'secretario', 'guia'), validar(idSchema, 'params'), motoController.obtener);

// Escritura y cambio de estado: solo admin y secretario
router.post('/', auth, permitirRoles('admin', 'secretario'), validar(motoSchema), motoController.crear);
router.put('/:id', auth, permitirRoles('admin', 'secretario'), validar(idSchema, 'params'), validar(motoSchema), motoController.actualizar);
router.patch(
  '/:id/estado',
  auth,
  permitirRoles('admin', 'secretario'),
  validar(idSchema, 'params'),
  validar(estadoMotoSchema),
  motoController.cambiarEstado
);

export default router;
