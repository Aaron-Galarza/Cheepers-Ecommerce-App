// Backend/src/routes/orderRoutes.ts

import { Router } from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getMyOrders // Si lo vas a usar, imp\u00F3rtalo
} from '../controllers/orderController';
import { protect, admin } from '../middleware/authMiddleware'; // Aseg\u00FArate que estas rutas est\u00E1n correctas

const router = Router();

// Rutas de Pedidos

// Crear un pedido (solo para usuarios autenticados)
router.post('/', protect, createOrder);

// Obtener todos los pedidos (solo para administradores)
router.get('/', protect, admin, getOrders); // <-- Esta ruta ir\u00E1 antes de getOrderById si la montas en /api/orders

// Obtener mis pedidos (solo para el usuario autenticado)
router.get('/myorders', protect, getMyOrders); // Una ruta espec\u00EDfica antes de :id

// Obtener un pedido por ID (el usuario debe ser el due\u00F1o o un admin)
router.get('/:id', protect, getOrderById);

// Actualizar el estado de un pedido (solo para administradores)
router.put('/:id/status', protect, admin, updateOrderStatus);

export default router;