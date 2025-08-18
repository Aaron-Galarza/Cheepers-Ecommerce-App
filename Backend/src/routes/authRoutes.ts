// Backend/src/routes/authRoutes.ts

import { Router } from 'express';
import { registerUser, loginUser } from '../controllers/authController';
import {loginLimiter} from '../middleware/authMiddleware'

const router = Router();

router.post('/register', registerUser); // Para crear un nuevo usuario/negocio
router.post('/login', loginUser, loginLimiter); // Para el login

export default router;