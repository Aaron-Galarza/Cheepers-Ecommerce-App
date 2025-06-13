import { Router } from 'express';
import { getProducts, createProduct } from '../controllers/productController';
import asyncHandler from 'express-async-handler'; // <-- IMPORTANTE: Importa asyncHandler

const router = Router();

// Usa asyncHandler para envolver tus funciones de controlador
router.get('/products', asyncHandler(getProducts));
router.post('/products', asyncHandler(createProduct));

export default router;