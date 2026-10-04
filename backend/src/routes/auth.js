import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { auth } from '../middlewares/auth.js';
import { validar } from '../middlewares/validate.js';
import { loginSchema } from '../utils/schemas.js';

const router = Router();

router.post('/login', validar(loginSchema), authController.iniciarSesion);
router.get('/me', auth, authController.obtenerSesion);

export default router;
