// Backend/src/routes/productRoutes.ts

import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController'; // Tus controladores de producto
import { protect, admin } from '../middleware/authMiddleware'; // <--- IMPORTA LOS MIDDLEWARES

const router = Router();

// Rutas p\u00FAblicas (cualquiera puede ver los productos)
router.get('/', asyncHandler(getProducts));
router.get('/:id', asyncHandler(getProductById));

// Rutas protegidas (solo usuarios autenticados y administradores pueden hacer estas operaciones)
// Para crear un producto, necesitas estar autenticado Y ser admin
router.post('/', protect, admin, asyncHandler(createProduct));
// Para actualizar un producto, necesitas estar autenticado Y ser admin
router.put('/:id', protect, admin, asyncHandler(updateProduct));
// Para eliminar un producto, necesitas estar autenticado Y ser admin
router.delete('/:id', protect, admin, asyncHandler(deleteProduct));

export default router;