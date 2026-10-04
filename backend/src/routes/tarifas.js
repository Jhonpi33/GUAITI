import { Router } from 'express';
import * as tarifaController from '../controllers/tarifaPagoGuiaController.js';
import { auth } from '../middlewares/auth.js';
import { permitirRoles } from '../middlewares/permitirRoles.js';
import { validar } from '../middlewares/validate.js';
import { tarifaSchema, idSchema } from '../utils/schemas.js';

const router = Router();

// Las tarifas de pago al guía solo las gestiona el administrador
router.use(auth, permitirRoles('admin'));

router.get('/', tarifaController.listar);
router.get('/:id', validar(idSchema, 'params'), tarifaController.obtener);
router.post('/', validar(tarifaSchema), tarifaController.crear);
router.put('/:id', validar(idSchema, 'params'), validar(tarifaSchema), tarifaController.actualizar);
router.delete('/:id', validar(idSchema, 'params'), tarifaController.eliminar);

export default router;
