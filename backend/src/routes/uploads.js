import { Router } from 'express';
import * as uploadController from '../controllers/uploadController.js';
import { auth } from '../middlewares/auth.js';
import { permitirRoles } from '../middlewares/permitirRoles.js';
import { subida } from '../middlewares/upload.js';

const router = Router();

router.post(
  '/foto',
  auth,
  permitirRoles('admin', 'secretario', 'guia'),
  subida.any(),
  uploadController.subirFoto
);

export default router;
