import { Router } from 'express';
import * as usuarioController from '../controllers/usuarioController.js';
import { auth } from '../middlewares/auth.js';
import { permitirRoles } from '../middlewares/permitirRoles.js';
import { validar } from '../middlewares/validate.js';
import { crearUsuarioSchema, editarUsuarioSchema, idSchema } from '../utils/schemas.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// Solo el administrador gestiona usuarios
router.use(auth, permitirRoles('admin'));

router.get('/', usuarioController.listar);
router.get('/:id', validar(idSchema, 'params'), usuarioController.obtener);
router.post('/', validar(crearUsuarioSchema), usuarioController.crear);
router.put('/:id', validar(idSchema, 'params'), validar(editarUsuarioSchema), usuarioController.actualizar);

// No se borran usuarios: se desactivan
router.patch(
  '/:id/activo',
  validar(idSchema, 'params'),
  asyncHandler(async (req, res, next) => {
    req.body = { activo: req.body.activo === true || req.body.activo === 'true' };
    next();
  }),
  usuarioController.actualizar
);

export default router;
