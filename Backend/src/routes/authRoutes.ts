// Backend/src/routes/authRoutes.ts

import { Router } from 'express';
import { registerUser, loginUser } from '../controllers/authController';

const router = Router();

router.post('/negocio/register', registerUser); // Para crear un nuevo usuario/negocio
router.post('/negocio/login', loginUser);     // Para el login

export default router;