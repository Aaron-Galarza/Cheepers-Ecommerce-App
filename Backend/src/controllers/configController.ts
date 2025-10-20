import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { getCashDiscountStatus } from '../utils/schedule'; 

// @desc    Obtener el estado actual de la promoción de descuento en efectivo
// @route   GET /api/config/discount-status
// @access  Public (Para uso del front-end)
export const getDiscountStatus = asyncHandler(async (req: Request, res: Response) => {
    const { isActive, percentage } = await getCashDiscountStatus();
    
    // Respuesta que el frontend consumirá
    res.status(200).json({ 
        isDiscountActive: isActive,
        discountPercentage: percentage,
        message: isActive ? `¡El descuento en efectivo del ${percentage}% está activo hoy!` : 'El descuento en efectivo NO está activo hoy.',
    });
});