import express from 'express';
import { getProducts } from '../controllers/productController'; // Importamos la función controladora

const router = express.Router();

// @desc    Obtener todos los productos
// @route   GET /
router.get('/', getProducts);

export default router;