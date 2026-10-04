import { Router } from 'express';
import * as actividadController from '../controllers/actividadController.js';
import { auth } from '../middlewares/auth.js';
import { permitirRoles } from '../middlewares/permitirRoles.js';
import { validar } from '../middlewares/validate.js';
import { actividadSchema, idSchema } from '../utils/schemas.js';

const router = Router();

// Lectura para admin, secretario y guía
router.get('/', auth, permitirRoles('admin', 'secretario', 'guia'), actividadController.listar);
router.get('/:id', auth, permitirRoles('admin', 'secretario', 'guia'), validar(idSchema, 'params'), actividadController.obtener);

// Escritura solo para administrador
router.post('/', auth, permitirRoles('admin'), validar(actividadSchema), actividadController.crear);
router.put('/:id', auth, permitirRoles('admin'), validar(idSchema, 'params'), validar(actividadSchema), actividadController.actualizar);

export default router;
