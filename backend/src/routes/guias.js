import { Router } from 'express';
import * as guiaController from '../controllers/guiaController.js';
import { auth } from '../middlewares/auth.js';
import { permitirRoles } from '../middlewares/permitirRoles.js';
import { validar } from '../middlewares/validate.js';
import { crearGuiaSchema, editarGuiaSchema, idSchema } from '../utils/schemas.js';

const router = Router();

router.use(auth, permitirRoles('admin', 'secretario'));

router.get('/', guiaController.listar);
router.get('/:id', validar(idSchema, 'params'), guiaController.obtener);
router.post('/', validar(crearGuiaSchema), guiaController.crear);
router.put('/:id', validar(idSchema, 'params'), validar(editarGuiaSchema), guiaController.actualizar);
router.delete('/:id', validar(idSchema, 'params'), guiaController.desactivar);

export default router;
