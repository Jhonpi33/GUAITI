import { Router } from 'express';
import * as panelGuiaController from '../controllers/panelGuiaController.js';
import { auth } from '../middlewares/auth.js';
import { permitirRoles } from '../middlewares/permitirRoles.js';
import { resolverGuia } from '../middlewares/resolverGuia.js';

const router = Router();

router.get('/', auth, permitirRoles('guia'), resolverGuia, panelGuiaController.obtenerPanel);

export default router;
