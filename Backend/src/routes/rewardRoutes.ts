// Backend/src/routes/rewardRoutes.ts

import express from 'express';
import { protect, admin } from '../middleware/authMiddleware'; 
import { 
    createReward, 
    updateReward, 
    deleteReward, 
    getRewardById,
    getAllRewardsForAdmin // Nuevo endpoint para el listado Admin
} from '../controllers/rewardControllers'; 

const router = express.Router();

// Ruta de listado Admin
router.route('/admin')
    .get(protect, admin, getAllRewardsForAdmin); // GET: Todos los premios (incluye inactivos)

// Ruta de creación
router.route('/')
    .post(protect, admin, createReward); // POST: Crear premio

// Rutas por ID
router.route('/:id')
    .get(protect, admin, getRewardById) 
    .put(protect, admin, updateReward)  
    .delete(protect, admin, deleteReward);

// La ruta pública para el cliente (GET /rewards) la crearemos después.

export default router;