// Backend/src/routes/loyaltyRoutes.ts (Añadir la ruta de canje)

import express from 'express';
import { protect, admin } from '../middleware/authMiddleware'; 
import { 
    redeemPoints, 
} from '../controllers/loyaltyController'; 

const router = express.Router();

// Ruta de canje: Protegida para Admin/Cajero
router.route('/redeem')
    .post(protect, admin, redeemPoints); // POST /api/loyalty/redeem
    
export default router;