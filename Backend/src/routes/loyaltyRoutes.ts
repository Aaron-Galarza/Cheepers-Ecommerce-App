// Backend/src/routes/loyaltyRoutes.ts (Añadir la ruta de canje)

import express from 'express';
import { protect, admin } from '../middleware/authMiddleware'; 
import { 
    redeemPoints,
    getLoyaltyInfoByDni,
    getClientPointsByDni
} from '../controllers/loyaltyController'; 

const router = express.Router();

// Ruta de canje: Protegida para Admin/Cajero
router.route('/redeem')
    .post(protect, admin, redeemPoints); // POST /api/loyalty/redeem

router.route('/:dni/admin').get(protect, admin, getLoyaltyInfoByDni);

router.route('/:dni')
    .get(getClientPointsByDni)
    
export default router;