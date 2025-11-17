// Backend/src/controllers/loyaltyController.ts (Creación o adición de función)

import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
// Asegúrate de importar la función del servicio
import { processOrderPoints, redeemReward } from '../services/loyaltyService'; 
// Asumo que tienes una interfaz de Request personalizada si quieres usar req.user

// Interfaz para el cuerpo de canje
interface RedeemBody {
    dni: string;
    rewardId: string;
}

// ... (Aquí van las funciones que ya tienes: updateOrderStatus, etc.) ...

// @desc    Canjear un premio
// @route   POST /api/loyalty/redeem
// @access  Private/Admin (Solo un cajero o admin debería iniciar un canje)
export const redeemPoints = asyncHandler(async (req: Request<{}, {}, RedeemBody>, res: Response) => {    // 1. Validar que solo Admin/Cajero pueda canjear (lo gestionamos con middleware en la ruta)
    const { dni, rewardId } = req.body;

    if (!dni || !rewardId) {
        res.status(400);
        throw new Error('Debe proporcionar el DNI del cliente y el ID del premio (rewardId).');
    }

    // 2. Delegamos la lógica al servicio, que contiene todas las validaciones
    const result = await redeemReward(dni, rewardId);

    res.status(200).json(result);
});