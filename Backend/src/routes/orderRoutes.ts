// Backend/src/routes/orderRoutes.ts

import { Router } from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  deleteAllOrders,
} from '../controllers/orderController';
import { protect, admin, owner } from '../middleware/authMiddleware'; // Aseg\u00FArate que estas rutas est\u00E1n correctas

const router = Router();

// Rutas de Pedidos

// Crear un pedido (clientes, se usa mail y numero para confirmar un pedido/order)
router.post('/', createOrder);

// Obtener todos los pedidos (solo para administradores)
router.get('/', protect, admin, getOrders); // <-- Esta ruta ir\u00E1 antes de getOrderById si la montas en /api/orders

// Obtener un pedido por ID (el usuario debe ser el due\u00F1o o un admin)
router.get('/:id', protect, admin, getOrderById);

// Actualizar el estado de un pedido (solo para administradores)
router.put('/:id/status', protect, admin, updateOrderStatus);

router.route('/all').delete(protect, owner, deleteAllOrders); 


export default router;