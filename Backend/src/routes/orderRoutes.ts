import { Router } from 'express';
import { createOrder } from '../controllers/orderController';
import asyncHandler from 'express-async-handler'; // <-- IMPORTANTE: Importa asyncHandler

const router = Router();

// Usa asyncHandler para envolver tu función de controlador
router.post('/pedidos', asyncHandler(createOrder));

export default router;