import { Router } from 'express';
import * as clienteController from '../controllers/clienteController.js';
import { auth } from '../middlewares/auth.js';
import { permitirRoles } from '../middlewares/permitirRoles.js';
import { validar } from '../middlewares/validate.js';
import { crearClienteSchema, editarClienteSchema, idSchema } from '../utils/schemas.js';

const router = Router();

router.use(auth, permitirRoles('admin', 'secretario'));

router.get('/', clienteController.listar);
router.get('/:id', validar(idSchema, 'params'), clienteController.obtener);
router.post('/', validar(crearClienteSchema), clienteController.crear);
router.put('/:id', validar(idSchema, 'params'), validar(editarClienteSchema), clienteController.actualizar);
router.delete('/:id', validar(idSchema, 'params'), clienteController.eliminar);

export default router;
