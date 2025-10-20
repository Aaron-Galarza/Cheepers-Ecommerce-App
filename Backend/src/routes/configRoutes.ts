import express from 'express';
import { getDiscountStatus } from '../controllers/configController';

const router = express.Router();

// Ruta pública para que el frontend obtenga el estado del descuento
router.route('/discount-status').get(getDiscountStatus);

export default router;