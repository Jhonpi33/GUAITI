import { Router } from 'express';
import * as parametroController from '../controllers/parametroController.js';
import { auth } from '../middlewares/auth.js';
import { permitirRoles } from '../middlewares/permitirRoles.js';
import { validar } from '../middlewares/validate.js';
import { parametroSchema } from '../utils/schemas.js';

const router = Router();

router.use(auth, permitirRoles('admin', 'secretario'));

router.get('/', parametroController.listar);
router.get('/mapa', parametroController.mapa);
router.put('/:clave', validar(parametroSchema), parametroController.editar);

export default router;
