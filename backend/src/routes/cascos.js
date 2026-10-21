import { Router } from 'express';
import * as cascoController from '../controllers/cascoController.js';
import { auth } from '../middlewares/auth.js';
import { permitirRoles } from '../middlewares/permitirRoles.js';
import { validar } from '../middlewares/validate.js';
import { cascoSchema, editarCascoSchema, rangoCascosSchema, idSchema } from '../utils/schemas.js';

const router = Router();

router.get('/', auth, permitirRoles('admin', 'secretario', 'guia'), cascoController.listar);
router.get('/:id', auth, permitirRoles('admin', 'secretario', 'guia'), validar(idSchema, 'params'), cascoController.obtener);

router.post('/', auth, permitirRoles('admin'), validar(cascoSchema), cascoController.crear);

// El rango se monta antes que /:id para que "rango" no se interprete como un _id
router.put('/rango', auth, permitirRoles('admin'), validar(rangoCascosSchema), cascoController.ajustarRango);

router.put('/:id', auth, permitirRoles('admin'), validar(idSchema, 'params'), validar(editarCascoSchema), cascoController.actualizar);
router.delete('/:id', auth, permitirRoles('admin'), validar(idSchema, 'params'), cascoController.eliminar);

export default router;
