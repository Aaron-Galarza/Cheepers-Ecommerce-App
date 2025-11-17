// Backend/src/routes/rewardRoutes.ts

import express from 'express';
import { protect, admin } from '../middleware/authMiddleware'; 
import { 
    createReward, 
    updateReward, 
    deleteReward, 
    getRewardById,
    getAllRewardsForAdmin,
    listActiveRewards
} from '../controllers/rewardControllers'; 

const router = express.Router();

// Ruta de base
router.route('/')
    .get(listActiveRewards) // GET: Para el cliente, lista solo los activos.
    .post(protect, admin, createReward); // POST: Crear premio

// Ruta de listado Admin
router.route('/admin')
    .get(protect, admin, getAllRewardsForAdmin); // GET: Todos los premios (incluye inactivos)

// Rutas por ID
router.route('/:id')
    .get(protect, admin, getRewardById) 
    .put(protect, admin, updateReward)  
    .delete(protect, admin, deleteReward);


export default router;