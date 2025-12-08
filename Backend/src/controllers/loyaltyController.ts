// Backend/src/controllers/loyaltyController.ts (Creación o adición de función)

import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
// Asegúrate de importar la función del servicio
import { processOrderPoints, redeemReward, getClientLoyaltyInfo, getClientTotalPoints, validateArgentineDNI } from '../services/loyaltyService'; 
// Asumo que tienes una interfaz de Request personalizada si quieres usar req.user

// Interfaz para el cuerpo de canje
interface RedeemBody {
    dni: string;
    rewardId: string;
}

// @desc    Consultar puntos por DNI (Endpoint público para clientes)
// @route   GET /api/loyalty/public/points/:dni
// @access  Public
export const getClientPointsByDni = asyncHandler(async(req: Request, res: Response) => {
    const { dni } = req.params;

    if (!dni) {
        res.status(400);
        throw new Error ('Debe proporcionar un DNI para ver su saldo')
    }

    if (!validateArgentineDNI(dni)) {
        res.status(400);
        throw new Error('El DNI proporcionado no tiene un formato válido (7-8 dígitos, sin ceros iniciales).');
    }

    const totalPoints = await getClientTotalPoints(dni)
    if (totalPoints <= 0) {
        res.status(200).json({
            dni,
            message: 'El DNI no tiene puntos para canjear',
            totalPoints: 0
            
        })
    } else {
        res.status(200).json({
            dni,
            message: 'El DNI tiene la sieguiente cantidad:',
            totalPoints
            
        })

    }
})


// @desc    Canjear un premio
// @route   POST /api/loyalty/redeem
// @access  Private/Admin (Solo un cajero o admin debería iniciar un canje)
export const redeemPoints = asyncHandler(async (req: Request<{}, {}, RedeemBody>, res: Response) => {    // 1. Validar que solo Admin/Cajero pueda canjear (lo gestionamos con middleware en la ruta)
    const { dni, rewardId } = req.body;

    if (!dni || !rewardId) {
        res.status(400);
        throw new Error('Debe proporcionar el DNI del cliente y el ID del premio (rewardId).');
    }

    if (!validateArgentineDNI(dni)) {
        res.status(400);
        throw new Error('El DNI proporcionado no tiene un formato válido (7-8 dígitos, sin ceros iniciales).');
    }

    // 2. Delegamos la lógica al servicio, que contiene todas las validaciones
    const result = await redeemReward(dni, rewardId);

    res.status(200).json(result);
});

// @desc    Obtener puntos e historial de un cliente por DNI
// @route   GET /api/loyalty/:dni
// @access  Private/Admin (Solo un cajero o admin debería consultar por DNI)
export const getLoyaltyInfoByDni = asyncHandler(async (req: Request, res: Response) => {
    const dni = req.params.dni;

    if (!dni) {
        res.status(400);
        throw new Error('Debe proporcionar el DNI del cliente.');
    }

    if (!validateArgentineDNI(dni)) {
        res.status(400);
        throw new Error('El DNI proporcionado no tiene un formato válido (7-8 dígitos, sin ceros iniciales).');
    }

    // Delegamos la lógica al servicio
    const result = await getClientLoyaltyInfo(dni);

    if (!result.exists) {
        // Si la función de servicio indica que el DNI no existe
        res.status(404);
        throw new Error(`Cliente con DNI ${dni} no encontrado en el sistema de lealtad.`);
    }

    // Devolvemos los puntos y el historial
    res.status(200).json({
        totalPoints: result.totalPoints,
        history: result.history,
    });
});